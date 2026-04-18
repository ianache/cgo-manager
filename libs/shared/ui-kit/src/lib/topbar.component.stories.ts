import type { Meta, StoryObj } from '@storybook/angular';
import { TopbarComponent } from './topbar.component';
import { expect } from 'storybook/test';

const meta: Meta<TopbarComponent> = {
  component: TopbarComponent,
  title: 'TopbarComponent',
};
export default meta;

type Story = StoryObj<TopbarComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/topbar/gi)).toBeTruthy();
  },
};
