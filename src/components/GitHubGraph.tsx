"use client";

import React, { useEffect, useState } from "react";

interface ContributionDay {
  contributionCount: number;
  date: string;
  color: string;
}

interface Week {
  contributionDays: ContributionDay[];
}

interface ContributionCalendar {
  totalContributions: number;
  weeks: Week[];
}

export default function GitHubGraph() {
  const [calendar, setCalendar] = useState<ContributionCalendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContributions = async () => {
      const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN || process.env.VITE_GITHUB_TOKEN;

      if (!token || token === "your_token_here") {
        setError("Please configure your GitHub token in the .env file");
        setLoading(false);
        return;
      }

      const query = `
        {
          user(login: "AaravKashyap12") {
            contributionsCollection {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                    color
                  }
                }
              }
            }
          }
        }
      `;

      try {
        const response = await fetch("https://api.github.com/graphql", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query }),
        });

        const result = await response.json();

        if (result.errors) {
          throw new Error(result.errors[0].message);
        }

        setCalendar(result.data.user.contributionsCollection.contributionCalendar);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch contributions");
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, []);

  if (loading) {
    return (
      <div className="github-graph-state">
        <p>Loading graph...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="github-graph-state github-graph-state-error">
        <p>{error}</p>
      </div>
    );
  }

  if (!calendar) return null;

  const cellSize = 9;
  const cellGap = 2;
  const columnWidth = cellSize + cellGap;
  const boardWidth = calendar.weeks.length * columnWidth - cellGap;
  const days = calendar.weeks.flatMap((week) => week.contributionDays);

  const getColor = (count: number) => {
    if (count === 0) return "#161b22";
    if (count <= 3) return "#0e4429";
    if (count <= 6) return "#006d32";
    if (count <= 10) return "#26a641";
    return "#39d353";
  };

  const months: { label: string; colIndex: number }[] = [];
  let currentMonth = -1;

  const activeDays = days.filter((day) => day.contributionCount > 0).length;
  const strongestDay = Math.max(...days.map((day) => day.contributionCount));

  let longestStreak = 0;
  let runningStreak = 0;
  for (const day of days) {
    if (day.contributionCount > 0) {
      runningStreak += 1;
      longestStreak = Math.max(longestStreak, runningStreak);
    } else {
      runningStreak = 0;
    }
  }

  let currentStreak = 0;
  for (let index = days.length - 1; index >= 0; index -= 1) {
    if (days[index].contributionCount > 0) {
      currentStreak += 1;
    } else if (currentStreak > 0) {
      break;
    }
  }

  calendar.weeks.forEach((week, index) => {
    const firstDay = week.contributionDays[0];
    if (!firstDay) return;

    const date = new Date(firstDay.date);
    const month = date.getMonth();
    if (month !== currentMonth) {
      months.push({
        label: date.toLocaleString("default", { month: "short" }),
        colIndex: index,
      });
      currentMonth = month;
    }
  });

  const visibleMonths = months.reduce<typeof months>((accumulator, month, index) => {
    if (index === 0) {
      accumulator.push(month);
      return accumulator;
    }

    const previous = accumulator[accumulator.length - 1];
    const distance = month.colIndex - previous.colIndex;

    if (distance >= 4) {
      accumulator.push(month);
      return accumulator;
    }

    if (accumulator.length === 1 && previous.colIndex <= 1) {
      accumulator[0] = month;
    }

    return accumulator;
  }, []);

  return (
    <div className="github-graph-card">
      <div className="github-graph-summary">
        <div>
          <span className="github-graph-kicker">Contribution Map</span>
          <h4>{calendar.totalContributions.toLocaleString()}</h4>
          <p>contributions in the last year</p>
        </div>
        <div className="github-graph-metrics">
          <div className="github-graph-metric">
            <span>Active days</span>
            <strong>{activeDays}</strong>
          </div>
          <div className="github-graph-metric">
            <span>Current streak</span>
            <strong>{currentStreak}</strong>
          </div>
          <div className="github-graph-metric">
            <span>Best day</span>
            <strong>{strongestDay}</strong>
          </div>
          <div className="github-graph-metric">
            <span>Longest run</span>
            <strong>{longestStreak}</strong>
          </div>
        </div>
      </div>

      <div
        className="github-graph-board"
        style={
          {
            "--graph-cell": `${cellSize}px`,
            "--graph-gap": `${cellGap}px`,
          } as React.CSSProperties
        }
      >
        <div className="github-graph-months" style={{ width: `${boardWidth}px` }}>
          {visibleMonths.map((month, index) => (
            <div
              key={`${month.label}-${index}`}
              className="github-graph-month"
              style={{ left: `${Math.min(month.colIndex * columnWidth, boardWidth - 26)}px` }}
            >
              {month.label}
            </div>
          ))}
        </div>

        <div
          className="github-graph-grid"
          role="img"
          aria-label={`${calendar.totalContributions} GitHub contributions in the last year`}
          style={{ width: `${boardWidth}px` }}
        >
          {calendar.weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="github-graph-week">
              {week.contributionDays.map((day, dayIndex) => (
                <div
                  key={`${day.date}-${dayIndex}`}
                  className="github-graph-day"
                  title={`${day.contributionCount} contributions on ${day.date}`}
                  style={{ backgroundColor: getColor(day.contributionCount) }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="github-graph-footer">
        <div className="github-graph-legend">
          <span>Less</span>
          <div className="github-graph-legend-scale">
            {[0, 2, 5, 8, 12].map((count) => (
              <span key={count} style={{ backgroundColor: getColor(count) }} />
            ))}
          </div>
          <span>More</span>
        </div>
        <a href="https://github.com/AaravKashyap12" target="_blank" rel="noopener noreferrer">
          View GitHub -&gt;
        </a>
      </div>
    </div>
  );
}
