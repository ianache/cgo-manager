import {
  moduleMetadata,
  type Meta,
  type StoryObj,
  applicationConfig,
} from '@storybook/angular';
import { TopbarComponent } from './topbar.component';
import { provideRouter } from '@angular/router';
import { expect } from 'storybook/test';

const meta: Meta<TopbarComponent> = {
  component: TopbarComponent,
  title: 'CGO/Topbar',
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
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
