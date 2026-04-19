import {
  applicationConfig,
  type Meta,
  type StoryObj,
} from '@storybook/angular';
import { SidebarComponent } from './sidebar.component';
import { provideRouter } from '@angular/router';
import { expect } from 'storybook/test';

const meta: Meta<SidebarComponent> = {
  component: SidebarComponent,
  title: 'CGO/Sidebar',
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
};
export default meta;

type Story = StoryObj<SidebarComponent>;

export const Primary: Story = {
  args: {},
};

export const Heading: Story = {
  args: {},
  play: async ({ canvas }) => {
    await expect(canvas.getByText(/sidebar/gi)).toBeTruthy();
  },
};
