import type { Meta, StoryObj } from '@storybook/angular';
import { TableComponent } from './table.component';
import { expect } from 'storybook/test';

const meta: Meta<TableComponent> = {
  component: TableComponent,
  title: 'TableComponent',
};
export default meta;

type Story = StoryObj<TableComponent>;

export const Primary: Story = {
  args: {
    columns: [],
    data: [],
  },
};

export const Heading: Story = {
  args: {
    columns: [],
    data: [],
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/table/gi)).toBeTruthy();
  },
};
