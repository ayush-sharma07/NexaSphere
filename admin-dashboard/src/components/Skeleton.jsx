export function Skeleton({ height = 48, count = 1, width = "100%", borderRadius = 14 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-shimmer"
          style={{ height, width, borderRadius, marginBottom: 12 }}
        />
      ))}
    </>
  );
}