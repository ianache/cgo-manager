import type { Meta, StoryObj } from '@storybook/angular';
import { SharedUiKit } from './shared-ui-kit';
import { expect } from 'storybook/test';

const meta: Meta<SharedUiKit> = {
  component: SharedUiKit,
  title: 'SharedUiKit',
};
export default meta;

type Story = StoryObj<SharedUiKit>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/shared-ui-kit/gi)).toBeTruthy();
  },
};
