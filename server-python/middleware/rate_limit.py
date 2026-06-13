from __future__ import annotations

import time
from dataclasses import dataclass
from typing import Dict, Optional

from fastapi import Request
from fastapi.responses import JSONResponse


def _parse_positive_int(value: str | None, fallback: int) -> int:
    try:
        parsed = int(str(value).strip())
    except (TypeError, ValueError, AttributeError):
        return fallback

    return parsed if parsed > 0 else fallback


def _get_client_key(request: Request) -> str:
    auth_header = request.headers.get("authorization", "").strip()
    if auth_header:
        return f"auth:{auth_header}"

    session_id = request.headers.get("x-session-id", "").strip()
    if session_id:
        return f"session:{session_id}"

    forwarded_for = request.headers.get("x-forwarded-for", "").split(",")[0].strip()
    if forwarded_for:
        return f"ip:{forwarded_for}"

    real_ip = request.headers.get("x-real-ip", "").strip()
    if real_ip:
        return f"ip:{real_ip}"

    client_host = request.client.host if request.client else "unknown"
    return f"ip:{client_host}"


@dataclass
class _Bucket:
    count: int
    expires_at: float


class RateLimiter:
    def __init__(self, *, window_ms: int, max_requests: int, message: str, key_prefix: str) -> None:
        self.window_ms = window_ms
        self.max_requests = max_requests
        self.message = message
        self.key_prefix = key_prefix
        self._buckets: Dict[str, _Bucket] = {}

    def _cleanup(self, now: float) -> None:
        expired = [key for key, bucket in self._buckets.items() if bucket.expires_at <= now]
        for key in expired:
            self._buckets.pop(key, None)

    def check(self, request: Request) -> Optional[JSONResponse]:
        now = time.time()
        self._cleanup(now)

        key = f"{self.key_prefix}:{_get_client_key(request)}"
        bucket = self._buckets.get(key)

        if bucket is None or bucket.expires_at <= now:
            bucket = _Bucket(count=0, expires_at=now + (self.window_ms / 1000.0))
            self._buckets[key] = bucket

        bucket.count += 1

        remaining = max(self.max_requests - bucket.count, 0)
        reset_after_seconds = max(int(bucket.expires_at - now + 0.999), 1)

        if bucket.count > self.max_requests:
            response = JSONResponse(
                status_code=429,
                content={"error": self.message, "retryAfter": reset_after_seconds},
            )
            response.headers["Retry-After"] = str(reset_after_seconds)
            response.headers["X-RateLimit-Limit"] = str(self.max_requests)
            response.headers["X-RateLimit-Remaining"] = str(remaining)
            response.headers["X-RateLimit-Reset"] = str(int(bucket.expires_at))
            return response

        request.state.rate_limit_remaining = remaining
        request.state.rate_limit_reset = int(bucket.expires_at)
        return None


def create_rate_limiter(*, window_ms: int, max_requests: int, message: str, key_prefix: str) -> RateLimiter:
    return RateLimiter(window_ms=window_ms, max_requests=max_requests, message=message, key_prefix=key_prefix)