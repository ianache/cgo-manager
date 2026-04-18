import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';
import { expect } from 'storybook/test';

const meta: Meta<ButtonComponent> = {
  component: ButtonComponent,
  title: 'ButtonComponent',
};
export default meta;

type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  args: {
    variant: 'primary',
  },
};

export const Heading: Story = {
  args: {
    variant: 'primary',
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/button/gi)).toBeTruthy();
  },
};
