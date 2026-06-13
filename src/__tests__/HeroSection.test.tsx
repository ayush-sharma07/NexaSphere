import { beforeAll, beforeEach, afterEach, describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HeroSection from '../pages/home/HeroSection';

// Initialise i18next once before all tests so useTranslation() resolves keys
beforeAll(async () => {
  if (!i18n.isInitialized) {
    await i18n.use(initReactI18next).init({
      lng: 'en',
      fallbackLng: 'en',
      interpolation: { escapeValue: false },
      resources: {
        en: {
          translation: {
            hero: {
              tagline: "GL Bajaj's Student-Driven Tech Ecosystem",
              join_as_member: 'Join as Member',
              core_team: 'Core Team',
              want_to_be_part: 'Want to be part of the NexaSphere Core Team?',
              apply_for_core_team: 'Apply for Core Team',
              scroll: 'SCROLL',
              stats: {
                members: 'Members',
                activities: 'Activities',
                events_done: 'Events Done',
                ideas: 'Ideas',
              },
            },
          },
        },
      },
    });
  }
});

describe('HeroSection Component', () => {
  const mockOnTabChange = vi.fn();
  const mockOnApply = vi.fn();
  const mockOnJoin = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders hero section with tagline', () => {
    render(
      <HeroSection onTabChange={mockOnTabChange} onApply={mockOnApply} onJoin={mockOnJoin} />
    );
    expect(screen.getByText(/GL Bajaj's Student-Driven Tech Ecosystem/i)).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(
      <HeroSection onTabChange={mockOnTabChange} onApply={mockOnApply} onJoin={mockOnJoin} />
    );
    expect(screen.getByText(/Join as Member/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Core Team/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Apply for Core Team/i)).toBeInTheDocument();
  });

  it('calls onJoin when join button is clicked', async () => {
    render(
      <HeroSection onTabChange={mockOnTabChange} onApply={mockOnApply} onJoin={mockOnJoin} />
    );
    const joinBtn = screen.getByText(/Join as Member/i);
    fireEvent.click(joinBtn);
    expect(mockOnJoin).toHaveBeenCalled();
  });

  it('calls onApply when apply button is clicked', async () => {
    render(
      <HeroSection onTabChange={mockOnTabChange} onApply={mockOnApply} onJoin={mockOnJoin} />
    );
    const applyBtn = screen.getByText(/Apply for Core Team/i);
    fireEvent.click(applyBtn);
    expect(mockOnApply).toHaveBeenCalled();
  });

  it('calls onTabChange when team tab is clicked', async () => {
    render(
      <HeroSection onTabChange={mockOnTabChange} onApply={mockOnApply} onJoin={mockOnJoin} />
    );
    const teamBtns = screen.getAllByText('Core Team');
    fireEvent.click(teamBtns[0]);
    expect(mockOnTabChange).toHaveBeenCalledWith('Team');
  });

  it('renders stats bar after delay', async () => {
    render(
      <HeroSection onTabChange={mockOnTabChange} onApply={mockOnApply} onJoin={mockOnJoin} />
    );
    act(() => {
      vi.runAllTimers();
    });
    expect(screen.getByText(/Members/i)).toBeInTheDocument();
    expect(screen.getByText(/Activities/i)).toBeInTheDocument();
  });

  it('supports light theme prop', () => {
    const { container } = render(
      <HeroSection
        theme="light"
        onTabChange={mockOnTabChange}
        onApply={mockOnApply}
        onJoin={mockOnJoin}
      />
    );
    expect(container.querySelector('.hero-section')).toBeInTheDocument();
  });
});
