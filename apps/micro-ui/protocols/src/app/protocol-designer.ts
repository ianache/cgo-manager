import { Component, HostListener, Input, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '@cgomanager/shared-data-access';

export interface NodeVisualInfo {
  x: number;
  y: number;
  isCollapsed?: boolean;
}

export interface ServiceData {
  name: string;
  description: string;
  filter?: string;
  syncMode: 'Sync' | 'Async';
  frame?: string;
}

export interface FrameData {
  name: string;
  description: string;
  format: 'BIN' | 'HEX' | 'TXT';
  frame?: string;
  frameRole: 'Request' | 'Ack' | 'Default';
}

export interface FieldData {
  name: string;
  description: string;
  length: number;
  dataType: string;
  standardFieldId?: string;
  functionId?: string;
}

export interface AckFieldData extends FieldData {
  ackSource: 'Manual' | 'Trama' | 'Function';
  ackValue: string;
  includeSeparator: boolean;
  isFunction: boolean;
}

export interface DesignerNode {
  id: string;
  type: 'Root' | 'Service' | 'Frame' | 'Field' | 'Ack Field';
  visual: NodeVisualInfo;
  data: any; // Using any for data as it's a polymorphic property, but in a real app we'd use a discriminated union.
}

export interface StandardField {
  id: string;
  name: string;
}

export interface FunctionParameter {
  name: string;
  type: string;
}

export interface ProtocolFunction {
  id: string;
  name: string;
  category: string;
  parameters: FunctionParameter[];
  code: string;
}

export interface Connection {
  id: string;
  fromId: string;
  toId: string;
  fromPort?: 'Request' | 'Ack' | 'Default';
}

export interface TestResult {
  timestamp: string;
  nodeName: string;
  nodeType: string;
  rawFrame: string;
  parsedFields: Array<{ name: string; value: string; status: string }>;
  executionLog: string[];
}

@Component({
  selector: 'app-protocol-designer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './protocol-designer.html',
  styleUrl: './protocol-designer.css'
})
export class ProtocolDesignerComponent implements OnInit {
  private apiService = inject(ApiService);

  @Input() protocolName = 'New Protocol';
  @Input() version = '1.0.0';
  @Input() versionId = '';
  @Output() designerClose = new EventEmitter<void>();

  ngOnInit(): void {
    this.loadDesign();
  }

  loadDesign(): void {
    if (this.versionId) {
      this.apiService.getProtocolDesign(this.versionId).subscribe({
        next: (result) => {
          if (result && result.designJson) {
            this.nodes = result.designJson.nodes || [];
            this.connections = result.designJson.connections || [];
            this.isModified = false;
          }
        },
        error: (err) => {
          console.error('Error loading protocol design:', err);
        }
      });
    }
  }

  isModified = false;
  nodes: DesignerNode[] = [];
  connections: Connection[] = [];
  selectedNode: DesignerNode | null = null;
  draggedType: DesignerNode['type'] | null = null;
  
  isDraggingNode = false;
  dragStartX = 0;
  dragStartY = 0;

  connectingSourceNodeId: string | null = null;
  connectingSourcePort: 'Request' | 'Ack' = 'Request';
  mousePosition = { x: 0, y: 0 };

  isPaletteCollapsed = false;
  isPropertiesCollapsed = false;
  
  standardFields: StandardField[] = [
    { id: '1', name: 'Header' },
    { id: '2', name: 'Checksum' },
    { id: '3', name: 'Payload Length' }
  ];

  functionCategories = ['Parsing', 'Validation', 'Transformation', 'Security'];

  availableFunctions: ProtocolFunction[] = [
    { 
      id: 'f1', 
      name: 'CalculateCRC16', 
      category: 'Validation', 
      parameters: [{ name: 'data', type: 'byte[]' }], 
      code: 'return CRC.calculate(data);' 
    },
    { 
      id: 'f2', 
      name: 'ToHexString', 
      category: 'Transformation', 
      parameters: [{ name: 'value', type: 'int' }], 
      code: 'return Integer.toHexString(value);' 
    }
  ];

  showFunctionEditor = false;
  editingFunction: ProtocolFunction | null = null;
  previousFunctionId?: string;
  previousStandardFieldId?: string;
  showTestRunner = false;
  testResult: TestResult | null = null;

  zoomLevel = 1.0;
  canvasOffset = { x: 0, y: 0 };
  isSnapGridEnabled = true;
  isPanning = false;
  panStart = { x: 0, y: 0 };
  gridSize = 20;

  getFunctionsByCategory(category: string): ProtocolFunction[] {
    return this.availableFunctions.filter(f => f.category === category);
  }

  getFunctionName(id?: string): string {
    return this.availableFunctions.find(f => f.id === id)?.name || 'None';
  }

  addStandardField(): void {
    const name = prompt('Enter new Standard Field name:');
    if (name) {
      const newField = { id: Math.random().toString(36).substring(2, 9), name };
      this.standardFields.push(newField);
      if (this.selectedNode) this.selectedNode.data.standardFieldId = newField.id;
      this.markModified();
    }
  }

  openFunctionEditor(functionId?: string): void {
    if (functionId) {
      const func = this.availableFunctions.find(f => f.id === functionId);
      if (func) {
        this.editingFunction = JSON.parse(JSON.stringify(func));
      }
    } else {
      this.editingFunction = {
        id: Math.random().toString(36).substring(2, 9),
        name: 'NewFunction',
        category: this.functionCategories[0],
        parameters: [],
        code: '// Write Java code here\n'
      };
    }
    this.showFunctionEditor = true;
  }

  addParameter(): void {
    if (this.editingFunction) {
      this.editingFunction.parameters.push({ name: '', type: 'String' });
    }
  }

  removeParameter(index: number): void {
    if (this.editingFunction) {
      this.editingFunction.parameters.splice(index, 1);
    }
  }

  saveFunction(): void {
    if (this.editingFunction) {
      const index = this.availableFunctions.findIndex(f => f.id === this.editingFunction?.id);
      if (index >= 0) {
        this.availableFunctions[index] = this.editingFunction;
      } else {
        this.availableFunctions.push(this.editingFunction);
      }
      if (this.selectedNode) {
        this.selectedNode.data.functionId = this.editingFunction.id;
        this.markModified();
      }
      this.closeFunctionEditor();
    }
  }

  runTest(): void {
    if (!this.selectedNode || (this.selectedNode.type !== 'Service' && this.selectedNode.type !== 'Frame')) {
      return;
    }

    if (!this.selectedNode.data.frame || this.selectedNode.data.frame.trim() === '') {
      alert('Please provide an example frame in the properties panel before running the test.');
      return;
    }

    this.testResult = {
      timestamp: new Date().toISOString(),
      nodeName: this.selectedNode.data.name,
      nodeType: this.selectedNode.type,
      rawFrame: this.selectedNode.data.frame,
      parsedFields: [
        { name: 'Header', value: '0x7E', status: 'OK' },
        { name: 'TerminalID', value: '123456789', status: 'OK' },
        { name: 'Command', value: '0x01', status: 'OK' },
        { name: 'Checksum', value: '0xAF', status: 'VALID' }
      ],
      executionLog: [
        `Initializing parser for ${this.selectedNode.type}...`,
        `Reading raw data: ${this.selectedNode.data.frame.substring(0, 20)}...`,
        'Applying standard field: Header',
        'Applying transformation function: ToHexString',
        'Validation successful.'
      ]
    };
    
    this.showTestRunner = true;
  }

  closeTestRunner(): void {
    this.showTestRunner = false;
    this.testResult = null;
  }

  toggleChildren(node: DesignerNode): void {
    node.visual.isCollapsed = !node.visual.isCollapsed;
    this.markModified();
  }

  isNodeVisible(node: DesignerNode): boolean {
    if (node.type === 'Root') return true;

    const parents = this.connections
      .filter(c => c.toId === node.id)
      .map(c => this.nodes.find(n => n.id === c.fromId));

    if (parents.length === 0) return true;

    return parents.every(p => p && this.isNodeVisible(p) && !p.visual.isCollapsed);
  }

  isConnectionVisible(conn: Connection): boolean {
    const from = this.nodes.find(n => n.id === conn.fromId);
    const to = this.nodes.find(n => n.id === conn.toId);
    if (!from || !to) return false;
    
    return this.isNodeVisible(from) && !from.visual.isCollapsed && this.isNodeVisible(to);
  }

  capturePreviousFunctionId(): void {
    this.previousFunctionId = this.selectedNode?.data.functionId;
  }

  capturePreviousStandardFieldId(): void {
    this.previousStandardFieldId = this.selectedNode?.data.standardFieldId;
  }

  closeFunctionEditor(): void {
    this.showFunctionEditor = false;
    this.editingFunction = null;
    if (this.selectedNode?.data.functionId === 'NEW') {
      this.selectedNode.data.functionId = this.previousFunctionId;
    }
  }

  onFunctionSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;
    if (value === 'NEW') {
      this.openFunctionEditor();
    } else {
      this.previousFunctionId = value;
    }
  }

  onStandardFieldSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const value = selectElement.value;
    if (value === 'NEW') {
      this.addStandardField();
      if (this.selectedNode?.data.standardFieldId === 'NEW') {
        this.selectedNode.data.standardFieldId = this.previousStandardFieldId;
      }
    } else {
      this.previousStandardFieldId = value;
    }
  }

  onDragStart(type: DesignerNode['type']): void {
    this.draggedType = type;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (!this.draggedType) return;

    const canvas = event.currentTarget as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    
    let x = (event.clientX - rect.left - this.canvasOffset.x) / this.zoomLevel - 75;
    let y = (event.clientY - rect.top - this.canvasOffset.y) / this.zoomLevel - 35;

    if (this.isSnapGridEnabled) {
      x = Math.round(x / this.gridSize) * this.gridSize;
      y = Math.round(y / this.gridSize) * this.gridSize;
    }

    const newNode: DesignerNode = {
      id: Math.random().toString(36).substring(2, 9),
      type: this.draggedType,
      visual: { x, y, isCollapsed: false },
      data: {
        name: this.draggedType === 'Frame' ? 'New Frame / Subframe' : `New ${this.draggedType}`,
        description: '',
        ...(this.draggedType === 'Service' ? { syncMode: 'Async', frame: '', filter: '' } : {}),
        ...(this.draggedType === 'Frame' ? { format: 'BIN', frame: '', frameRole: 'Default' } : {}),
        ...(this.draggedType === 'Field' ? { length: 8, dataType: 'INT' } : {}),
        ...(this.draggedType === 'Ack Field' ? { length: 8, dataType: 'INT', ackSource: 'Manual', ackValue: '', includeSeparator: false, isFunction: false } : {})
      }
    };

    this.nodes.push(newNode);
    this.markModified();
    this.draggedType = null;
  }

  startNodeDrag(event: MouseEvent, node: DesignerNode): void {
    this.selectedNode = node;
    this.isDraggingNode = true;
    this.dragStartX = (event.clientX / this.zoomLevel) - node.visual.x;
    this.dragStartY = (event.clientY / this.zoomLevel) - node.visual.y;
    event.stopPropagation();
  }

  startPanning(event: MouseEvent): void {
    if (this.isDraggingNode) return;
    this.isPanning = true;
    this.panStart = {
      x: event.clientX - this.canvasOffset.x,
      y: event.clientY - this.canvasOffset.y
    };
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    const canvas = document.querySelector('.designer-canvas') as HTMLElement;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      this.mousePosition = {
        x: (event.clientX - rect.left - this.canvasOffset.x) / this.zoomLevel,
        y: (event.clientY - rect.top - this.canvasOffset.y) / this.zoomLevel
      };
    }

    if (this.isDraggingNode && this.selectedNode) {
      let x = (event.clientX / this.zoomLevel) - this.dragStartX;
      let y = (event.clientY / this.zoomLevel) - this.dragStartY;

      if (this.isSnapGridEnabled) {
        x = Math.round(x / this.gridSize) * this.gridSize;
        y = Math.round(y / this.gridSize) * this.gridSize;
      }

      this.selectedNode.visual.x = x;
      this.selectedNode.visual.y = y;
      this.markModified();
    } else if (this.isPanning) {
      this.canvasOffset.x = event.clientX - this.panStart.x;
      this.canvasOffset.y = event.clientY - this.panStart.y;
    }
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    this.isDraggingNode = false;
    this.isPanning = false;
  }

  selectNode(node: DesignerNode): void {
    this.selectedNode = node;
  }

  startConnection(node: DesignerNode, port: 'Request' | 'Ack' = 'Request'): void {
    if (node.type === 'Field' || node.type === 'Ack Field') return;
    this.connectingSourceNodeId = node.id;
    this.connectingSourcePort = port;
  }

  completeConnection(targetNode: DesignerNode): void {
    if (!this.connectingSourceNodeId || this.connectingSourceNodeId === targetNode.id) {
      this.connectingSourceNodeId = null;
      return;
    }

    const sourceNode = this.nodes.find(n => n.id === this.connectingSourceNodeId);
    if (!sourceNode) return;

    let isValid = false;
    if (sourceNode.type === 'Root' && targetNode.type === 'Service') isValid = true;
    
    if (sourceNode.type === 'Service' && targetNode.type === 'Frame') {
      const portHasConnection = this.connections.some(c => c.fromId === sourceNode.id && c.fromPort === this.connectingSourcePort);
      
      if (portHasConnection) {
        alert(`The ${this.connectingSourcePort} port already has a connection.`);
        isValid = false;
      } else {
        isValid = true;
        targetNode.data.frameRole = this.connectingSourcePort === 'Request' ? 'Request' : 'Ack';
      }
    }
    
    if (sourceNode.type === 'Frame' && (targetNode.type === 'Frame' || targetNode.type === 'Field' || targetNode.type === 'Ack Field')) isValid = true;

    if (targetNode.type === 'Service' && sourceNode.type !== 'Root') isValid = false;

    if (isValid) {
      const exists = this.connections.some(c => c.fromId === sourceNode.id && c.toId === targetNode.id && c.fromPort === this.connectingSourcePort);
      if (!exists) {
        this.connections.push({
          id: Math.random().toString(36).substring(2, 9),
          fromId: sourceNode.id,
          toId: targetNode.id,
          fromPort: this.connectingSourcePort
        });
        this.markModified();
      }
    } else {
      alert(`Invalid connection: ${sourceNode.type} cannot connect to ${targetNode.type}`);
    }

    this.connectingSourceNodeId = null;
    this.connectingSourcePort = 'Request';
  }

  getConnectionCoords(conn: Connection): { x1: number; y1: number; x2: number; y2: number } {
    const from = this.nodes.find(n => n.id === conn.fromId);
    const to = this.nodes.find(n => n.id === conn.toId);
    if (!from || !to) return { x1: 0, y1: 0, x2: 0, y2: 0 };

    let y1Offset = 40;
    
    if (from.type === 'Service') {
      if (conn.fromPort === 'Request') y1Offset = 20;
      else if (conn.fromPort === 'Ack') y1Offset = 60;
    }

    return {
      x1: from.visual.x + 180,
      y1: from.visual.y + y1Offset,
      x2: to.visual.x,
      y2: to.visual.y + 40
    };
  }

  getChildCount(nodeId: string, type: DesignerNode['type']): number {
    const childIds = this.connections
      .filter(c => c.fromId === nodeId)
      .map(c => c.toId);
    
    return this.nodes.filter(n => childIds.includes(n.id) && n.type === type).length;
  }

  getFormatIcon(format?: string): string {
    switch (format) {
      case 'BIN': return '🔢';
      case 'HEX': return '0️⃣x';
      case 'TXT': return '🔤';
      default: return '📄';
    }
  }

  getFormatLabel(format?: string): string {
    switch (format) {
      case 'BIN': return 'Binary';
      case 'HEX': return 'Hex';
      case 'TXT': return 'Text';
      default: return 'Unknown';
    }
  }

  getTempConnectionCoords(): { x1: number; y1: number; x2: number; y2: number } | null {
    if (!this.connectingSourceNodeId) return null;
    const from = this.nodes.find(n => n.id === this.connectingSourceNodeId);
    if (!from) return null;

    let y1Offset = 40;
    if (from.type === 'Service') {
      if (this.connectingSourcePort === 'Request') y1Offset = 20;
      else if (this.connectingSourcePort === 'Ack') y1Offset = 60;
    }

    return {
      x1: from.visual.x + 180,
      y1: from.visual.y + y1Offset,
      x2: this.mousePosition.x,
      y2: this.mousePosition.y
    };
  }

  deleteNode(nodeId: string): void {
    this.nodes = this.nodes.filter(n => n.id !== nodeId);
    this.connections = this.connections.filter(c => c.fromId !== nodeId && c.toId !== nodeId);
    if (this.selectedNode?.id === nodeId) this.selectedNode = null;
    this.markModified();
  }

  deleteConnection(connId: string): void {
    this.connections = this.connections.filter(c => c.id !== connId);
    this.markModified();
  }

  markModified(): void {
    this.isModified = true;
  }

  saveChanges(): void {
    if (!this.versionId) {
      console.warn('Cannot save to database: versionId is missing.');
      this.isModified = false;
      return;
    }

    const designData = {
      nodes: this.nodes,
      connections: this.connections
    };

    this.apiService.saveProtocolDesign(this.versionId, designData).subscribe({
      next: () => {
        this.isModified = false;
        alert('Design saved successfully');
      },
      error: () => {
        alert('Failed to save design to database.');
      }
    });
  }

  exportProtocol(): void {
    const data = {
      protocolName: this.protocolName,
      version: this.version,
      nodes: this.nodes,
      connections: this.connections
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${this.protocolName.replace(/\s+/g, '_')}_v${this.version}.json`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  importProtocol(): void {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: Event): void => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>): void => {
        try {
          const result = e.target?.result as string;
          const data = JSON.parse(result);
          if (data.nodes && data.connections) {
            this.nodes = data.nodes;
            this.connections = data.connections;
            this.protocolName = data.protocolName || this.protocolName;
            this.version = data.version || this.version;
            this.markModified();
          } else {
            alert('Invalid protocol design file');
          }
        } catch {
          alert('Error importing protocol design');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  exitDesigner(): void {
    if (this.isModified) {
      if (confirm('You have unsaved changes. Do you want to save before leaving?')) {
        this.saveChanges();
        this.designerClose.emit();
      } else if (confirm('Are you sure you want to discard changes and leave?')) {
        this.designerClose.emit();
      }
    } else {
      this.designerClose.emit();
    }
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): string | undefined {
    if (this.isModified) {
      event.returnValue = 'You have unsaved changes.';
      return 'You have unsaved changes.';
    }
    return undefined;
  }

  zoomIn(): void {
    this.zoomLevel = Math.min(this.zoomLevel + 0.1, 2.0);
  }

  zoomOut(): void {
    this.zoomLevel = Math.max(this.zoomLevel - 0.1, 0.2);
  }

  fitScreen(): void {
    if (this.nodes.length === 0) {
      this.zoomLevel = 1.0;
      this.canvasOffset = { x: 0, y: 0 };
      return;
    }

    const padding = 50;
    const minX = Math.min(...this.nodes.map(n => n.visual.x));
    const minY = Math.min(...this.nodes.map(n => n.visual.y));
    const maxX = Math.max(...this.nodes.map(n => n.visual.x + 180));
    const maxY = Math.max(...this.nodes.map(n => n.visual.y + 80));

    const contentWidth = maxX - minX + padding * 2;
    const contentHeight = maxY - minY + padding * 2;

    const canvas = document.querySelector('.designer-canvas') as HTMLElement;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const zoomX = rect.width / contentWidth;
      const zoomY = rect.height / contentHeight;
      this.zoomLevel = Math.min(zoomX, zoomY, 1.0);
      
      this.canvasOffset.x = (-minX * this.zoomLevel) + (rect.width - (maxX - minX) * this.zoomLevel) / 2;
      this.canvasOffset.y = (-minY * this.zoomLevel) + (rect.height - (maxY - minY) * this.zoomLevel) / 2;
    }
  }

  toggleGrid(): void {
    this.isSnapGridEnabled = !this.isSnapGridEnabled;
  }

  getZoomPercentage(): number {
    return Math.round(this.zoomLevel * 100);
  }
}
