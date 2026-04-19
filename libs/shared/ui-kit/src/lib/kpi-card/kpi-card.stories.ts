import type { Meta, StoryObj } from '@storybook/angular';
import { KpiCardComponent } from './kpi-card';

const meta: Meta<KpiCardComponent> = {
  component: KpiCardComponent,
  title: 'CGO/KpiCard',
};
export default meta;

type Story = StoryObj<KpiCardComponent>;

export const Tenants: Story = {
  args: {
    label: 'Total Tenants',
    value: 24,
    trend: 12,
    icon: '🏢',
  },
};

export const Satellites: Story = {
  args: {
    label: 'Active Satellites',
    value: 142,
    trend: 5,
    icon: '🛰️',
  },
};

export const Uptime: Story = {
  args: {
    label: 'Platform Uptime',
    value: '99.98%',
    trend: 0.01,
    icon: '🛡️',
  },
};

export const Alerts: Story = {
  args: {
    label: 'System Alerts',
    value: 3,
    trend: -50,
    icon: '⚠️',
  },
};
