import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProtocolDesignerComponent } from './protocol-designer';
import { ApiService } from '@cgomanager/shared-data-access';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ProtocolDesignerComponent', () => {
  let component: ProtocolDesignerComponent;
  let fixture: ComponentFixture<ProtocolDesignerComponent>;
  let apiService: ApiService;

  const mockDesign = {
    designJson: {
      nodes: [{ id: '1', type: 'Root', visual: { x: 0, y: 0 }, data: { name: 'Root' } }],
      connections: []
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProtocolDesignerComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ApiService,
          useValue: {
            getProtocolDesign: () => of(mockDesign),
            saveProtocolDesign: () => of({})
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProtocolDesignerComponent);
    component = fixture.componentInstance;
    apiService = TestBed.inject(ApiService);
    component.versionId = 'test-version-id';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load design on init', () => {
    const spy = vi.spyOn(apiService, 'getProtocolDesign');
    component.ngOnInit();
    expect(spy).toHaveBeenCalledWith('test-version-id');
    expect(component.nodes.length).toBe(1);
    expect(component.nodes[0].id).toBe('1');
  });
});
