import React from 'react';
import './PageSkeleton.css';

const Bone = ({ className = '', style = {} }) => (
  <div className={`skeleton-bone ${className}`} style={style} />
);

/**
 * Wardrobe page skeleton
 */
export function WardrobeSkeleton() {
  return (
    <div className="skeleton-page">
      <div className="skeleton-header">
        <div className="skeleton-header-text">
          <Bone className="skeleton-title" />
          <Bone className="skeleton-subtitle" />
        </div>
        <Bone className="skeleton-header-btn" />
      </div>

      <div className="skeleton-stats">
        {[1, 2, 3, 4].map(i => (
          <Bone key={i} className="skeleton-stat-card" />
        ))}
      </div>

      <Bone className="skeleton-search" />

      <div className="skeleton-filters">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Bone key={i} className="skeleton-filter-tab" />
        ))}
      </div>

      <div className="skeleton-grid">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="skeleton-card">
            <Bone className="skeleton-card-image" />
            <div className="skeleton-card-body">
              <Bone className="skeleton-card-title" />
              <Bone className="skeleton-card-meta" />
              <div className="skeleton-card-tags">
                <Bone className="skeleton-tag" />
                <Bone className="skeleton-tag" />
                <Bone className="skeleton-tag" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Outfit History page skeleton
 */
export function HistorySkeleton() {
  return (
    <div className="skeleton-page">
      <div className="skeleton-header">
        <div className="skeleton-header-text">
          <Bone className="skeleton-title" />
          <Bone className="skeleton-subtitle" />
        </div>
        <Bone className="skeleton-header-btn" />
      </div>

      <div className="skeleton-stats">
        {[1, 2, 3].map(i => (
          <Bone key={i} className="skeleton-stat-card" />
        ))}
      </div>

      <div className="skeleton-grid">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="skeleton-history-card">
            <div className="skeleton-history-header">
              <Bone className="skeleton-history-title" />
              <div className="skeleton-history-actions">
                <Bone className="skeleton-history-action" />
                <Bone className="skeleton-history-action" />
                <Bone className="skeleton-history-action" />
              </div>
            </div>
            <div className="skeleton-history-thumbs">
              {[1, 2, 3, 4].map(j => (
                <Bone key={j} className="skeleton-history-thumb" />
              ))}
            </div>
            <Bone className="skeleton-history-date" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Outfit Generator page skeleton
 */
export function GeneratorSkeleton() {
  return (
    <div className="skeleton-page">
      <div className="skeleton-header">
        <div className="skeleton-header-text">
          <Bone className="skeleton-title" />
          <Bone className="skeleton-subtitle" />
        </div>
      </div>

      <div className="skeleton-form">
        <div className="skeleton-form-row">
          <Bone className="skeleton-form-field" />
          <Bone className="skeleton-form-field" />
        </div>
        <div className="skeleton-form-row">
          <Bone className="skeleton-form-field" />
          <Bone className="skeleton-form-field" />
        </div>
        <Bone className="skeleton-form-btn" />
      </div>

      <div className="skeleton-grid">
        {[1, 2, 3].map(i => (
          <div key={i} className="skeleton-card">
            <Bone className="skeleton-card-image" />
            <div className="skeleton-card-body">
              <Bone className="skeleton-card-title" />
              <Bone className="skeleton-card-meta" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Planner page skeleton
 */
export function PlannerSkeleton() {
  return (
    <div className="skeleton-page">
      <div className="skeleton-header">
        <div className="skeleton-header-text">
          <Bone className="skeleton-title" />
          <Bone className="skeleton-subtitle" />
        </div>
      </div>

      <div className="skeleton-calendar">
        <div className="skeleton-calendar-header">
          <Bone className="skeleton-calendar-nav" />
          <Bone className="skeleton-calendar-month" />
          <Bone className="skeleton-calendar-nav" />
        </div>
        <div className="skeleton-calendar-grid">
          {[...Array(7)].map((_, i) => (
            <Bone key={`h-${i}`} className="skeleton-calendar-day-header" />
          ))}
          {[...Array(35)].map((_, i) => (
            <Bone key={i} className="skeleton-calendar-day" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default {
  WardrobeSkeleton,
  HistorySkeleton,
  GeneratorSkeleton,
  PlannerSkeleton,
};
