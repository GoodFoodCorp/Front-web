import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DayPoint } from '../types/analytics.types';

/**
 * Daily trend, either revenue (line) or order count (bars).
 *
 * Both marks use the brand green family rather than the accent yellow: yellow
 * only reaches 1.5:1 contrast on a white card, which is unreadable for the
 * mark itself. Each chart carries a single series, so its title identifies it
 * and no legend is needed.
 */

const BRAND = '#004430';
const BRAND_LIGHT = '#0a5c40';
const GRID = '#00443014';
const AXIS_TICK = { fontSize: 12, fill: '#6b7280' };

function formatDay(day: string): string {
  const [, month, dayOfMonth] = day.split('-');
  return `${dayOfMonth}/${month}`;
}

function CardFrame({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-brand/10 bg-white p-5">
      <h2 className="font-display font-bold text-brand">{title}</h2>
      <p className="mb-4 text-sm text-neutral-400">{subtitle}</p>
      {children}
    </div>
  );
}

export function RevenueTrendChart({ points, title = 'Aperçu des ventes', subtitle }: {
  points: DayPoint[];
  title?: string;
  subtitle?: string;
}) {
  const data = points.map((p) => ({ label: formatDay(p.day), revenue: p.revenueCents / 100 }));

  return (
    <CardFrame title={title} subtitle={subtitle ?? `Chiffre d'affaires par jour`}>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ left: -20, right: 8 }}>
          <CartesianGrid strokeDasharray="4 4" stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} minTickGap={24} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(2)} €`, 'Chiffre d’affaires']}
            labelFormatter={(label: string) => `Le ${label}`}
          />
          {/* No dot per point: at 30+ points they turn into noise. The hover
              marker is the read affordance instead. */}
          <Line
            type="monotone"
            dataKey="revenue"
            stroke={BRAND}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </CardFrame>
  );
}

export function OrdersTrendChart({ points, title = 'Aperçu des commandes', subtitle }: {
  points: DayPoint[];
  title?: string;
  subtitle?: string;
}) {
  const data = points.map((p) => ({ label: formatDay(p.day), orders: p.ordersCount }));

  return (
    <CardFrame title={title} subtitle={subtitle ?? 'Nombre de commandes par jour'}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ left: -20, right: 8 }} barCategoryGap={2}>
          <CartesianGrid strokeDasharray="4 4" stroke={GRID} vertical={false} />
          <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} minTickGap={24} />
          <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
          <Tooltip
            formatter={(value: number) => [String(value), 'Commandes']}
            labelFormatter={(label: string) => `Le ${label}`}
            cursor={{ fill: GRID }}
          />
          <Bar dataKey="orders" fill={BRAND_LIGHT} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardFrame>
  );
}
