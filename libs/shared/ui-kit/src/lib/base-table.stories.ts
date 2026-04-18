import type { Meta, StoryObj } from '@storybook/angular';
import { BaseTableComponent } from './base-table';

const meta: Meta<BaseTableComponent> = {
  component: BaseTableComponent,
  title: 'CGO/BaseTable',
};
export default meta;

type Story = StoryObj<BaseTableComponent>;

export const Primary: Story = {
  args: {
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'role', label: 'Role' },
    ],
    data: [
      { id: '1', name: 'John Doe', role: 'Admin' },
      { id: '2', name: 'Jane Smith', role: 'User' },
    ],
    showActions: false,
  },
};

export const WithActions: Story = {
  args: {
    ...Primary.args,
    showActions: true,
  },
};
