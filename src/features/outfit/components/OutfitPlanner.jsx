import React, { useState } from 'react';
import './OutfitPlanner.css';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useUser } from '@clerk/clerk-react';
import { PlannerSkeleton } from '@/shared/components/PageSkeleton';

export default function OutfitPlanner() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const userId = user?.id;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Convex queries
  const rawPlanned = useQuery(api.planner.getUserPlannedOutfits, userId ? { userId } : "skip");
  const rawHistory = useQuery(api.wardrobe.getOutfitHistory, userId ? { userId } : "skip");
  const isLoading = !isUserLoaded || (userId && (rawPlanned === undefined || rawHistory === undefined));
  const plannedOutfits = rawPlanned || [];
  const outfitHistory = rawHistory || [];

  // Convex mutations
  const addPlan = useMutation(api.planner.addPlannedOutfit);
  const deletePlan = useMutation(api.planner.deletePlannedOutfit);

  if (isLoading) return <PlannerSkeleton />;

  // ── Calendar helpers ──
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const formatDateStr = (day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getPlansForDate = (dateStr) => {
    return plannedOutfits.filter(p => p.date === dateStr);
  };

  // ── Navigation ──
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // ── Actions ──
  const handleDateClick = (day) => {
    const dateStr = formatDateStr(day);
    setSelectedDate(dateStr);
    setShowModal(true);
  };

  const handleAssignOutfit = async (outfitId) => {
    if (!userId || !selectedDate) return;
    await addPlan({ userId, outfitId, date: selectedDate });
  };

  const handleDeletePlan = async (planId) => {
    await deletePlan({ planId });
  };

  // ── Build calendar grid ──
  const calendarCells = [];
  // Empty cells for offset
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(<div key={`empty-${i}`} className="calendar-cell empty"></div>);
  }
  // Day cells
  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDateStr(day);
    const isToday = dateStr === todayStr;
    const isSelected = dateStr === selectedDate;
    const plans = getPlansForDate(dateStr);
    const hasPlan = plans.length > 0;

    calendarCells.push(
      <div
        key={day}
        className={`calendar-cell day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''} ${hasPlan ? 'has-plan' : ''}`}
        onClick={() => handleDateClick(day)}
      >
        <span className="day-number">{day}</span>
        {hasPlan && (
          <div className="plan-indicators">
            {plans.slice(0, 3).map((plan, idx) => {
              const firstItem = plan.outfit?.items?.[0];
              return firstItem?.imageUrl ? (
                <img
                  key={idx}
                  src={firstItem.imageUrl}
                  alt=""
                  className="plan-thumb"
                />
              ) : (
                <div key={idx} className="plan-dot"></div>
              );
            })}
            {plans.length > 3 && <span className="plan-more">+{plans.length - 3}</span>}
          </div>
        )}
      </div>
    );
  }

  // ── Modal: plans for selected date ──
  const selectedPlans = selectedDate ? getPlansForDate(selectedDate) : [];
  const formattedSelectedDate = selectedDate
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '';

  // Outfits available to assign (exclude already-planned ones for that date)
  const alreadyPlannedIds = new Set(selectedPlans.map(p => p.outfitId));
  const availableOutfits = outfitHistory.filter(o => !alreadyPlannedIds.has(o._id));

  return (
    <div className="planner-container">
      {/* Header */}
      <section className="planner-header">
        <div className="header-content">
          <div className="header-text">
            <h1 className="planner-title">Outfit Planner</h1>
            <p className="planner-subtitle">Plan your outfits for the days ahead</p>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{plannedOutfits.length}</span>
              <span className="stat-label">Planned</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{outfitHistory.length}</span>
              <span className="stat-label">Available Outfits</span>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar */}
      <section className="calendar-section">
        <div className="calendar-nav">
          <button className="nav-btn" onClick={prevMonth}>
            <i className="bi bi-chevron-left"></i>
          </button>
          <div className="calendar-title">
            <h2>{monthNames[month]} {year}</h2>
            <button className="today-btn" onClick={goToToday}>Today</button>
          </div>
          <button className="nav-btn" onClick={nextMonth}>
            <i className="bi bi-chevron-right"></i>
          </button>
        </div>

        <div className="calendar-grid">
          {dayNames.map(d => (
            <div key={d} className="calendar-cell header">{d}</div>
          ))}
          {calendarCells}
        </div>
      </section>

      {/* Modal */}
      {showModal && selectedDate && (
        <div className="planner-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="planner-modal" onClick={e => e.stopPropagation()}>
            <div className="planner-modal-header">
              <div>
                <h2>{formattedSelectedDate}</h2>
                <p className="modal-subtitle">{selectedPlans.length} outfit(s) planned</p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)} aria-label="Close">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="planner-modal-body">
              {/* Existing plans for this date */}
              {selectedPlans.length > 0 && (
                <div className="planned-section">
                  <h3>Planned Outfits</h3>
                  <div className="planned-list">
                    {selectedPlans.map(plan => (
                      <div key={plan._id} className="planned-card">
                        <div className="planned-card-images">
                          {plan.outfit?.items?.slice(0, 3).map((item, idx) => (
                            <img key={idx} src={item.imageUrl} alt={item.name} />
                          ))}
                          {(!plan.outfit?.items || plan.outfit.items.length === 0) && (
                            <div className="planned-placeholder">
                              <i className="bi bi-hanger"></i>
                            </div>
                          )}
                        </div>
                        <div className="planned-card-info">
                          <h4>{plan.outfit?.title || 'Outfit'}</h4>
                          <div className="planned-tags">
                            {plan.outfit?.occasion && <span className="tag">{plan.outfit.occasion}</span>}
                            {plan.outfit?.season && <span className="tag">{plan.outfit.season}</span>}
                          </div>
                        </div>
                        <button
                          className="remove-plan-btn"
                          onClick={() => handleDeletePlan(plan._id)}
                          aria-label="Remove plan"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assign new outfit */}
              <div className="assign-section">
                <h3>Add an Outfit</h3>
                {availableOutfits.length === 0 ? (
                  <div className="empty-outfits">
                    <i className="bi bi-emoji-frown"></i>
                    <p>No outfits available. Generate some from the Outfit Generator first!</p>
                  </div>
                ) : (
                  <div className="assign-list">
                    {availableOutfits.map(outfit => (
                      <div
                        key={outfit._id}
                        className="assign-card"
                        onClick={() => handleAssignOutfit(outfit._id)}
                      >
                        <div className="assign-card-images">
                          {outfit.items?.slice(0, 3).map((item, idx) => (
                            <img key={idx} src={item.imageUrl} alt={item.name} />
                          ))}
                          {(!outfit.items || outfit.items.length === 0) && (
                            <div className="assign-placeholder">
                              <i className="bi bi-hanger"></i>
                            </div>
                          )}
                        </div>
                        <div className="assign-card-info">
                          <h4>{outfit.title || 'Outfit'}</h4>
                          <div className="assign-tags">
                            {outfit.occasion && <span className="tag">{outfit.occasion}</span>}
                            {outfit.season && <span className="tag">{outfit.season}</span>}
                          </div>
                        </div>
                        <div className="assign-action">
                          <i className="bi bi-plus-circle-fill"></i>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
