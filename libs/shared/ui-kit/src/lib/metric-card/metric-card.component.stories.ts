import type { Meta, StoryObj } from '@storybook/angular';
import { MetricCardComponent } from './metric-card.component';
import { expect } from 'storybook/test';

const meta: Meta<MetricCardComponent> = {
  component: MetricCardComponent,
  title: 'MetricCardComponent',
};
export default meta;

type Story = StoryObj<MetricCardComponent>;

export const Primary: Story = {
  args: {
    label: '',
    value: '',
    trend: 0,
  },
};

export const Heading: Story = {
  args: {
    label: '',
    value: '',
    trend: 0,
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/metric-card/gi)).toBeTruthy();
  },
};
