import React from 'react';

const Bone = ({ className = '', style = {} }) => (
  <div className={`animate-pulse bg-surface-container-high rounded-md ${className}`} style={style} />
);

/**
 * Home page skeleton
 */
export function HomeSkeleton() {
  return (
    <div className="w-full bg-surface min-h-[90vh]">
      {/* Editorial Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-surface/80 border-b border-outline-variant/20">
        <div className="max-w-[1400px] mx-auto px-6 py-5 flex justify-between items-center">
          <Bone className="w-32 h-6" />
          <div className="hidden lg:flex items-center gap-8">
            <Bone className="w-24 h-10 rounded-md" />
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-16 lg:pt-48 lg:pb-32 px-6 lg:px-12 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-5 flex flex-col space-y-8">
            <Bone className="w-32 h-4" />
            <Bone className="w-full h-24 lg:h-32" />
            <Bone className="w-3/4 h-16" />
            <Bone className="w-48 h-14 rounded-md mt-4" />
          </div>

          <div className="lg:col-span-6 lg:col-start-7 relative">
            <Bone className="w-full aspect-[4/5] lg:aspect-square rounded-lg" />
          </div>
        </div>
      </main>
    </div>
  );
}

/**
 * Wardrobe page skeleton
 */
export function WardrobeSkeleton() {
  return (
    <div className="w-full bg-surface min-h-[90vh]">
      <div className="px-6 lg:px-12 pt-10 pb-6 max-w-[1400px] mx-auto flex justify-between">
        <div className="flex flex-col gap-2">
          <Bone className="w-48 h-10" />
          <Bone className="w-64 h-4" />
        </div>
        <Bone className="w-32 h-10 rounded-full" />
      </div>

      <div className="px-6 lg:px-12 max-w-[1400px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {[1, 2, 3, 4].map(i => (
          <Bone key={i} className="h-20 rounded-xl" />
        ))}
      </div>

      <div className="px-6 lg:px-12 max-w-[1400px] mx-auto mt-6 flex gap-2">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Bone key={i} className="w-24 h-10 rounded-full" />
        ))}
      </div>

      <div className="px-6 lg:px-12 max-w-[1400px] mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
          <div key={i} className="flex flex-col gap-3">
            <Bone className="w-full aspect-[4/5] rounded-2xl" />
            <div className="flex flex-col gap-2">
              <Bone className="w-3/4 h-4" />
              <Bone className="w-1/2 h-3" />
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
    <div className="w-full bg-surface min-h-[90vh]">
      <div className="px-6 lg:px-12 pt-10 pb-6 max-w-[1400px] mx-auto flex justify-between">
        <div className="flex flex-col gap-2">
          <Bone className="w-48 h-10" />
          <Bone className="w-64 h-4" />
        </div>
        <Bone className="w-32 h-10 rounded-full" />
      </div>

      <div className="px-6 lg:px-12 max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="flex flex-col gap-3 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/30">
             <Bone className="w-full aspect-video rounded-lg" />
             <Bone className="w-1/2 h-5 mt-2" />
             <div className="flex gap-2">
                <Bone className="w-12 h-4 rounded-full" />
                <Bone className="w-12 h-4 rounded-full" />
             </div>
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
    <div className="w-full bg-surface min-h-[90vh]">
      <div className="px-6 lg:px-12 pt-10 pb-6 max-w-[1400px] mx-auto flex flex-col gap-2">
        <Bone className="w-64 h-10" />
        <Bone className="w-96 h-4" />
      </div>

      <div className="px-6 lg:px-12 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 mt-6">
        <div className="lg:col-span-7 flex flex-col gap-8">
           <Bone className="w-24 h-4" />
           <div className="flex gap-2"><Bone className="w-24 h-10 rounded-full" /><Bone className="w-24 h-10 rounded-full" /><Bone className="w-24 h-10 rounded-full" /></div>
           <Bone className="w-24 h-4 mt-4" />
           <div className="flex gap-2"><Bone className="w-24 h-10 rounded-full" /><Bone className="w-24 h-10 rounded-full" /></div>
           <Bone className="w-full h-14 rounded-lg mt-8" />
        </div>
        <div className="lg:col-span-5 flex flex-col gap-4">
           <Bone className="w-32 h-6" />
           <Bone className="w-full h-24 rounded-lg" />
           <Bone className="w-full h-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

/**
 * Planner page skeleton
 */
export function PlannerSkeleton() {
  return (
    <div className="w-full bg-surface min-h-[90vh]">
      <div className="px-6 lg:px-12 pt-10 pb-6 max-w-[1400px] mx-auto flex justify-between">
        <div className="flex flex-col gap-2">
          <Bone className="w-48 h-10" />
          <Bone className="w-64 h-4" />
        </div>
        <Bone className="w-48 h-16 rounded-xl" />
      </div>

      <div className="px-6 lg:px-12 max-w-[1400px] mx-auto mt-6">
        <div className="flex justify-between items-center mb-6">
           <Bone className="w-48 h-8" />
           <div className="flex gap-2"><Bone className="w-10 h-10 rounded-full" /><Bone className="w-10 h-10 rounded-full" /></div>
        </div>
        <div className="grid grid-cols-7 gap-2 lg:gap-4">
           {[...Array(35)].map((_, i) => (
             <Bone key={i} className="min-h-[80px] rounded-lg" />
           ))}
        </div>
      </div>
    </div>
  );
}

export default {
  HomeSkeleton,
  WardrobeSkeleton,
  HistorySkeleton,
  GeneratorSkeleton,
  PlannerSkeleton,
};
