import type { Meta, StoryObj } from '@storybook/angular';
import { FormHeaderComponent } from './form-header';
import { ButtonComponent } from './button.component';

const meta: Meta<FormHeaderComponent> = {
  component: FormHeaderComponent,
  title: 'FormHeaderComponent',
};
export default meta;

type Story = StoryObj<FormHeaderComponent>;

export const Primary: Story = {
  args: {
    title: 'Tenant Management',
    description: 'Manage satellite tracking permissions and white-label branding for your clients.',
  },
};

export const WithActions: Story = {
  args: {
    title: 'Tenant Management',
    description: 'Manage satellite tracking permissions and white-label branding for your clients.',
  },
  render: (args) => ({
    props: args,
    template: `
      <cgo-form-header [title]="title" [description]="description">
        <button actions class="btn btn-primary">+ ADD NEW TENANT</button>
      </cgo-form-header>
    `,
    moduleMetadata: {
      imports: [ButtonComponent],
    },
  }),
};
