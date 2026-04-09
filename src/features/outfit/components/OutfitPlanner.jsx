import React, { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { useUser } from '@clerk/clerk-react';
import { PlannerSkeleton } from '@/shared/components/PageSkeleton';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiX, FiCheck, FiPlus, FiTrash2 } from 'react-icons/fi';

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
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

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
    calendarCells.push(<div key={`empty-${i}`} className="min-h-[80px] p-2 bg-surface-container-low/30 rounded-lg"></div>);
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
        onClick={() => handleDateClick(day)}
        className={`min-h-[80px] p-2 md:p-3 rounded-lg border transition cursor-pointer flex flex-col justify-between ${
          isToday 
            ? 'border-primary-container bg-primary-container/5' 
            : 'border-outline-variant/30 bg-surface-container-lowest hover:border-primary-container/50'
        } ${isSelected ? 'ring-2 ring-primary-container ring-offset-2 ring-offset-surface' : ''}`}
      >
        <span className={`font-display font-semibold text-sm ${isToday ? 'text-primary-container' : 'text-on-surface'}`}>
          {day}
        </span>
        
        {hasPlan && (
          <div className="flex -space-x-2 mt-2">
            {plans.slice(0, 3).map((plan, idx) => {
              const firstItem = plan.outfit?.items?.[0];
              return firstItem?.imageUrl ? (
                <img
                  key={idx}
                  src={firstItem.imageUrl}
                  className="w-6 h-6 rounded-full border-2 border-surface-container-lowest object-cover"
                />
              ) : (
                <div key={idx} className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-secondary-container"></div>
              );
            })}
            {plans.length > 3 && (
              <div className="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-surface-container-high flex items-center justify-center">
                <span className="text-[8px] font-bold">+{plans.length - 3}</span>
              </div>
            )}
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

  const alreadyPlannedIds = new Set(selectedPlans.map(p => p.outfitId));
  const availableOutfits = outfitHistory.filter(o => !alreadyPlannedIds.has(o._id));

  return (
    <div className="w-full bg-surface pb-[90px] lg:pb-12 min-h-screen">
      
      {/* Header */}
      <section className="px-6 lg:px-12 pt-10 pb-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="font-display text-4xl font-bold text-on-surface tracking-tight leading-[1.1]">Planner</h1>
            <p className="font-body text-sm text-on-surface/60 mt-2 max-w-sm">Schedule your curated looks for the upcoming weeks.</p>
          </div>
          
          <div className="flex gap-4 p-4 rounded-lg bg-surface-container-low border border-outline-variant/30">
            <div>
              <p className="font-display font-bold text-xl leading-none">{plannedOutfits.length}</p>
              <p className="font-label text-[10px] text-on-surface/60 uppercase tracking-widest mt-1">Scheduled</p>
            </div>
            <div className="w-px bg-outline-variant/50"></div>
            <div>
              <p className="font-display font-bold text-xl leading-none">{outfitHistory.length}</p>
              <p className="font-label text-[10px] text-on-surface/60 uppercase tracking-widest mt-1">Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Calendar View */}
      <section className="px-6 lg:px-12 max-w-[1400px] mx-auto mt-4">
        
        {/* Calendar Nav */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h2 className="font-display font-bold text-2xl">{monthNames[month]} {year}</h2>
            <button 
              onClick={goToToday}
              className="px-3 py-1 rounded-full bg-secondary-container/50 text-on-secondary-container font-label text-xs uppercase tracking-wider hover:bg-secondary-container transition"
            >
              Today
            </button>
          </div>
          <div className="flex gap-2">
            <button onClick={prevMonth} className="p-2 rounded-full border border-outline-variant/50 hover:bg-surface-container-low transition">
              <FiChevronLeft />
            </button>
            <button onClick={nextMonth} className="p-2 rounded-full border border-outline-variant/50 hover:bg-surface-container-low transition">
              <FiChevronRight />
            </button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2 lg:gap-4">
          {dayNames.map(d => (
            <div key={d} className="font-label text-xs uppercase tracking-wider text-on-surface/50 text-center pb-2">
              {d}
            </div>
          ))}
          {calendarCells}
        </div>
      </section>

      {/* Modal Overlay */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pb-safe">
          <div className="absolute inset-0 bg-on-surface/20 backdrop-blur-md" onClick={() => setShowModal(false)}></div>
          
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-surface-container-lowest rounded-2xl shadow-ambient overflow-y-auto hide-scrollbar flex flex-col">
            
            <div className="sticky top-0 bg-surface-container-lowest/90 backdrop-blur-xl border-b border-outline-variant/20 px-6 py-4 flex justify-between items-center z-10">
              <div>
                <h2 className="font-display font-bold text-lg">{formattedSelectedDate}</h2>
                <p className="font-label text-[10px] uppercase tracking-wider text-primary-container mt-1">{selectedPlans.length} Outfit(s) Planned</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 -mr-2 rounded-full hover:bg-surface-container-low transition">
                <FiX />
              </button>
            </div>

            <div className="p-6 flex flex-col gap-8">
              
              {/* Existing Plans */}
              {selectedPlans.length > 0 && (
                <div>
                  <h3 className="font-display font-semibold text-sm mb-4 uppercase tracking-widest text-on-surface/80 flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-outline-variant"></span> Scheduled For Today
                  </h3>
                  <div className="flex flex-col gap-3">
                    {selectedPlans.map(plan => (
                      <div key={plan._id} className="flex items-center gap-4 p-3 pr-4 rounded-xl border border-primary-container/20 bg-primary-container/5">
                        <div className="flex -space-x-3 w-20 shrink-0">
                          {plan.outfit?.items?.slice(0, 3).map((item, idx) => (
                            <img key={idx} src={item.imageUrl} className="w-10 h-10 rounded-full border-2 border-surface-container-lowest object-cover" />
                          ))}
                        </div>
                        <div className="flex-grow">
                          <p className="font-body font-semibold text-sm">{plan.outfit?.title || 'Outfit'}</p>
                          <div className="flex gap-2 mt-1">
                            {plan.outfit?.occasion && <span className="font-label text-[9px] uppercase tracking-wider text-on-surface/60">{plan.outfit.occasion}</span>}
                            {plan.outfit?.season && <span className="font-label text-[9px] uppercase tracking-wider text-on-surface/60">{plan.outfit.season}</span>}
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeletePlan(plan._id)}
                          className="p-2 text-on-surface/40 hover:text-error hover:bg-error/10 rounded-full transition"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assign New Outfit */}
              <div>
                <h3 className="font-display font-semibold text-sm mb-4 uppercase tracking-widest text-on-surface/80 flex items-center gap-2">
                  <span className="w-4 h-[1px] bg-outline-variant"></span> Add Saved Outfit
                </h3>
                
                {availableOutfits.length === 0 ? (
                  <div className="p-6 bg-surface-container-low rounded-xl text-center">
                    <FiCalendar className="mx-auto text-on-surface/40 mb-2" size={24} />
                    <p className="font-body text-sm text-on-surface/60">No available outfits to schedule.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availableOutfits.map((outfit) => (
                      <div 
                        key={outfit._id}
                        onClick={() => handleAssignOutfit(outfit._id)}
                        className="group flex gap-3 p-3 rounded-xl border border-outline-variant/30 bg-surface-container-lowest hover:border-primary-container/50 hover:bg-surface-container-low transition cursor-pointer"
                      >
                        <div className="w-16 h-16 rounded-lg bg-surface-container-high flex overflow-hidden shrink-0 shadow-sm relative">
                           {outfit.items?.slice(0, 2).map((item, idx) => (
                              <img key={idx} src={item.imageUrl} className="w-full h-full object-cover mix-blend-multiply" />
                           ))}
                           <div className="absolute inset-0 bg-primary-container/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex flex-col justify-center items-center">
                                <FiPlus size={14} />
                              </div>
                           </div>
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="font-body font-semibold text-xs line-clamp-1">{outfit.title || 'Outfit'}</p>
                          <div className="flex gap-2 mt-1">
                            {outfit.occasion && <span className="font-label text-[8px] uppercase tracking-wider text-on-surface/60">{outfit.occasion}</span>}
                          </div>
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

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .pb-safe { padding-bottom: env(safe-area-bottom); }
      `}} />
    </div>
  );
}
