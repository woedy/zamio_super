import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

type PagePadding = 'none' | 'sm' | 'md' | 'lg';

const containerPadding: Record<PagePadding, string> = {
  none: 'px-0 py-0',
  sm: 'px-4 py-4',
  md: 'px-6 py-8',
  lg: 'px-8 py-12',
};

const sectionPadding: Record<PagePadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const bleedClass = '-mx-3 md:-mx-4 2xl:-mx-5';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: PagePadding;
  bleed?: boolean;
}

export const PageContainer = forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, padding = 'md', style, bleed = false, ...props }, ref) => (
    <div
      ref={ref}
      style={style}
      className={cn(
        'relative isolate flex min-h-screen w-full flex-col overflow-hidden bg-gradient-to-br',
        'from-[#f4f7ff] via-[#ecf1ff] to-[#e1e9ff] text-slate-900',
        'before:pointer-events-none before:absolute before:-top-36 before:left-1/2 before:h-[460px] before:w-[460px] before:-translate-x-1/2 before:rounded-full before:bg-sky-400/25 before:blur-3xl before:content-[""]',
        'after:pointer-events-none after:absolute after:-bottom-40 after:right-[-20%] after:h-[380px] after:w-[380px] after:rounded-full after:bg-fuchsia-400/20 after:blur-3xl after:content-[""]',
        'dark:from-[#050b1b] dark:via-[#08132d] dark:to-[#030812] dark:text-slate-100 dark:before:bg-sky-500/25 dark:after:bg-fuchsia-500/25',
        'shadow-[0_28px_80px_rgba(8,15,45,0.12)] dark:shadow-[0_32px_80px_rgba(2,6,18,0.55)]',
        'transition-colors duration-300 ease-out',
        bleed ? 'rounded-none' : 'rounded-[32px]',
        containerPadding[padding],
        bleed && bleedClass,
        className,
      )}
      {...props}
    />
  ),
);

PageContainer.displayName = 'PageContainer';

export interface PageSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: PagePadding;
  subtle?: boolean;
}

export const PageSection = forwardRef<HTMLDivElement, PageSectionProps>(
  ({ className, padding = 'md', subtle = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-3xl border transition-all duration-300 ease-out',
        'border-white/60 bg-white/80 text-slate-900 shadow-[0_24px_55px_rgba(15,23,42,0.08)] backdrop-blur-2xl',
        'before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:bg-gradient-to-br before:from-white/60 before:via-white/30 before:to-transparent before:opacity-80 before:content-[""]',
        'dark:border-white/12 dark:bg-white/10 dark:text-slate-100 dark:shadow-[0_30px_60px_rgba(5,8,32,0.5)] dark:before:from-white/10 dark:before:via-white/5 dark:before:to-transparent',
        subtle &&
          'border-white/40 bg-white/70 text-slate-900 shadow-none backdrop-blur-xl before:hidden dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:shadow-none',
        sectionPadding[padding],
        className,
      )}
      {...props}
    />
  ),
);

PageSection.displayName = 'PageSection';

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader = ({ title, subtitle, icon, actions, className, ...props }: PageHeaderProps) => (
  <div
    className={cn(
      'flex flex-wrap items-center justify-between gap-5 rounded-3xl border px-6 py-5 transition-all duration-300 ease-out',
      'border-white/60 bg-white/85 text-slate-900 shadow-[0_24px_55px_rgba(15,23,42,0.08)] backdrop-blur-2xl',
      'dark:border-white/12 dark:bg-white/10 dark:text-slate-100 dark:shadow-[0_24px_55px_rgba(5,8,32,0.45)]',
      className,
    )}
    {...props}
  >
    <div className="flex items-center gap-4">
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 via-sky-500/15 to-cyan-400/15 text-indigo-600 shadow-md shadow-indigo-500/20 dark:from-indigo-500/60 dark:via-sky-500/50 dark:to-cyan-400/50 dark:text-white dark:shadow-indigo-500/30">
          {icon}
        </div>
      )}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-600 dark:text-white/70">{subtitle}</p>}
      </div>
    </div>
    {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
  </div>
);

PageHeader.displayName = 'PageHeader';

export const PageBody = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-10', className)}
      {...props}
    />
  ),
);

PageBody.displayName = 'PageBody';
