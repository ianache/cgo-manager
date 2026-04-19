import { Component, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface DesignerNode {
  id: string;
  type: 'Root' | 'Service' | 'Frame' | 'Field' | 'Ack Field';
  name: string;
  description: string;
  x: number;
  y: number;
  dataType?: string;
  format?: 'BIN' | 'HEX' | 'TXT';
  // New attributes
  frame?: string; // For Service and Frame
  length?: number; // For Field and Ack Field
  standardFieldId?: string; // For Field
  functionId?: string; // For Field and Ack Field (when source is Function)
  isCollapsed?: boolean; 
  syncMode?: 'Sync' | 'Async'; // For Service
  frameRole?: 'Request' | 'Ack' | 'Default'; // For Frame
  // Ack Field Specific
  ackSource?: 'Manual' | 'Trama' | 'Function';
  ackValue?: string;
  includeSeparator?: boolean;
  isFunction?: boolean;
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

@Component({
  selector: 'app-protocol-designer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './protocol-designer.html',
  styleUrl: './protocol-designer.css'
})
export class ProtocolDesignerComponent {
  @Input() protocolName = 'New Protocol';
  @Input() version = '1.0.0';
  @Output() designerClose = new EventEmitter<void>();

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

  // Designer View State
  isPaletteCollapsed = false;
  isPropertiesCollapsed = false;
  
  // New Data for fields and functions
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

  // Modals/Editors state
  showFunctionEditor = false;
  editingFunction: ProtocolFunction | null = null;
  previousFunctionId?: string;
  previousStandardFieldId?: string;
  showTestRunner = false;
  testResult: any = null;

  zoomLevel = 1.0;
  canvasOffset = { x: 0, y: 0 };
  isSnapGridEnabled = true;
  isPanning = false;
  panStart = { x: 0, y: 0 };
  gridSize = 20;

  // Helper methods for new features
  getFunctionsByCategory(category: string) {
    return this.availableFunctions.filter(f => f.category === category);
  }

  getFunctionName(id?: string) {
    return this.availableFunctions.find(f => f.id === id)?.name || 'None';
  }

  addStandardField() {
    const name = prompt('Enter new Standard Field name:');
    if (name) {
      const newField = { id: Math.random().toString(36).substr(2, 9), name };
      this.standardFields.push(newField);
      if (this.selectedNode) this.selectedNode.standardFieldId = newField.id;
      this.markModified();
    }
  }

  openFunctionEditor(functionId?: string) {
    if (functionId) {
      const func = this.availableFunctions.find(f => f.id === functionId);
      if (func) {
        this.editingFunction = JSON.parse(JSON.stringify(func)); // Deep clone
      }
    } else {
      this.editingFunction = {
        id: Math.random().toString(36).substr(2, 9),
        name: 'NewFunction',
        category: this.functionCategories[0],
        parameters: [],
        code: '// Write Java code here\n'
      };
    }
    this.showFunctionEditor = true;
  }

  addParameter() {
    if (this.editingFunction) {
      this.editingFunction.parameters.push({ name: '', type: 'String' });
    }
  }

  removeParameter(index: number) {
    if (this.editingFunction) {
      this.editingFunction.parameters.splice(index, 1);
    }
  }

  saveFunction() {
    if (this.editingFunction) {
      const index = this.availableFunctions.findIndex(f => f.id === this.editingFunction!.id);
      if (index >= 0) {
        this.availableFunctions[index] = this.editingFunction;
      } else {
        this.availableFunctions.push(this.editingFunction);
      }
      if (this.selectedNode) {
        this.selectedNode.functionId = this.editingFunction.id;
        this.markModified();
      }
      this.closeFunctionEditor();
    }
  }

  runTest() {
    if (!this.selectedNode || (this.selectedNode.type !== 'Service' && this.selectedNode.type !== 'Frame')) {
      return;
    }

    if (!this.selectedNode.frame || this.selectedNode.frame.trim() === '') {
      alert('Please provide an example frame in the properties panel before running the test.');
      return;
    }

    // Simulate parsing logic
    this.testResult = {
      timestamp: new Date().toISOString(),
      nodeName: this.selectedNode.name,
      nodeType: this.selectedNode.type,
      rawFrame: this.selectedNode.frame,
      parsedFields: [
        { name: 'Header', value: '0x7E', status: 'OK' },
        { name: 'TerminalID', value: '123456789', status: 'OK' },
        { name: 'Command', value: '0x01', status: 'OK' },
        { name: 'Checksum', value: '0xAF', status: 'VALID' }
      ],
      executionLog: [
        `Initializing parser for ${this.selectedNode.type}...`,
        `Reading raw data: ${this.selectedNode.frame.substring(0, 20)}...`,
        'Applying standard field: Header',
        'Applying transformation function: ToHexString',
        'Validation successful.'
      ]
    };
    
    this.showTestRunner = true;
  }

  closeTestRunner() {
    this.showTestRunner = false;
    this.testResult = null;
  }

  toggleChildren(node: DesignerNode) {
    node.isCollapsed = !node.isCollapsed;
    this.markModified();
  }

  isNodeVisible(node: DesignerNode): boolean {
    // A node is visible if it's the Root or if all its parents are visible and not collapsed
    if (node.type === 'Root') return true;

    const parents = this.connections
      .filter(c => c.toId === node.id)
      .map(c => this.nodes.find(n => n.id === c.fromId));

    if (parents.length === 0) return true; // Orphan nodes are visible

    // If any parent is collapsed or hidden, this node should be hidden
    return parents.every(p => p && this.isNodeVisible(p) && !p.isCollapsed);
  }

  isConnectionVisible(conn: Connection): boolean {
    const from = this.nodes.find(n => n.id === conn.fromId);
    const to = this.nodes.find(n => n.id === conn.toId);
    if (!from || !to) return false;
    
    // Connection is visible if source node is visible AND not collapsed, 
    // and target node is visible
    return this.isNodeVisible(from) && !from.isCollapsed && this.isNodeVisible(to);
  }

  capturePreviousFunctionId() {
    this.previousFunctionId = this.selectedNode?.functionId;
  }

  capturePreviousStandardFieldId() {
    this.previousStandardFieldId = this.selectedNode?.standardFieldId;
  }

  closeFunctionEditor() {
    this.showFunctionEditor = false;
    this.editingFunction = null;
    // Rollback if we were in "NEW" mode and didn't save
    if (this.selectedNode?.functionId === 'NEW') {
      this.selectedNode.functionId = this.previousFunctionId;
    }
  }

  onFunctionSelect(event: any) {
    const value = event.target.value;
    if (value === 'NEW') {
      this.openFunctionEditor();
    } else {
      this.previousFunctionId = value;
    }
  }

  onStandardFieldSelect(event: any) {
    const value = event.target.value;
    if (value === 'NEW') {
      this.addStandardField();
      if (this.selectedNode?.standardFieldId === 'NEW') {
        this.selectedNode.standardFieldId = this.previousStandardFieldId;
      }
    } else {
      this.previousStandardFieldId = value;
    }
  }

  onDragStart(type: DesignerNode['type']) {
    this.draggedType = type;
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    if (!this.draggedType) return;

    const canvas = event.currentTarget as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    
    // Account for zoom and offset
    let x = (event.clientX - rect.left - this.canvasOffset.x) / this.zoomLevel - 75;
    let y = (event.clientY - rect.top - this.canvasOffset.y) / this.zoomLevel - 35;

    if (this.isSnapGridEnabled) {
      x = Math.round(x / this.gridSize) * this.gridSize;
      y = Math.round(y / this.gridSize) * this.gridSize;
    }

    const newNode: DesignerNode = {
      id: Math.random().toString(36).substr(2, 9),
      type: this.draggedType,
      name: this.draggedType === 'Frame' ? 'New Frame / Subframe' : `New ${this.draggedType}`,
      description: '',
      x,
      y,
      format: this.draggedType === 'Frame' ? 'BIN' : undefined,
      frame: (this.draggedType === 'Service' || this.draggedType === 'Frame') ? '' : undefined,
      syncMode: this.draggedType === 'Service' ? 'Async' : undefined,
      frameRole: this.draggedType === 'Frame' ? 'Default' : undefined,
      ackSource: this.draggedType === 'Ack Field' ? 'Manual' : undefined,
      ackValue: this.draggedType === 'Ack Field' ? '' : undefined,
      includeSeparator: this.draggedType === 'Ack Field' ? false : undefined,
      isFunction: this.draggedType === 'Ack Field' ? false : undefined
    };

    this.nodes.push(newNode);
    this.markModified();
    this.draggedType = null;
  }

  startNodeDrag(event: MouseEvent, node: DesignerNode) {
    this.selectedNode = node;
    this.isDraggingNode = true;
    this.dragStartX = (event.clientX / this.zoomLevel) - node.x;
    this.dragStartY = (event.clientY / this.zoomLevel) - node.y;
    event.stopPropagation();
  }

  startPanning(event: MouseEvent) {
    if (this.isDraggingNode) return;
    this.isPanning = true;
    this.panStart = {
      x: event.clientX - this.canvasOffset.x,
      y: event.clientY - this.canvasOffset.y
    };
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
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

      this.selectedNode.x = x;
      this.selectedNode.y = y;
      this.markModified();
    } else if (this.isPanning) {
      this.canvasOffset.x = event.clientX - this.panStart.x;
      this.canvasOffset.y = event.clientY - this.panStart.y;
    }
  }

  @HostListener('window:mouseup')
  onMouseUp() {
    this.isDraggingNode = false;
    this.isPanning = false;
  }

  selectNode(node: DesignerNode) {
    this.selectedNode = node;
  }

  startConnection(node: DesignerNode, port: 'Request' | 'Ack' = 'Request') {
    if (node.type === 'Field' || node.type === 'Ack Field') return; // Terminal nodes
    this.connectingSourceNodeId = node.id;
    this.connectingSourcePort = port;
  }

  completeConnection(targetNode: DesignerNode) {
    if (!this.connectingSourceNodeId || this.connectingSourceNodeId === targetNode.id) {
      this.connectingSourceNodeId = null;
      return;
    }

    const sourceNode = this.nodes.find(n => n.id === this.connectingSourceNodeId);
    if (!sourceNode) return;

    // Rules
    let isValid = false;
    if (sourceNode.type === 'Root' && targetNode.type === 'Service') isValid = true;
    
    if (sourceNode.type === 'Service' && targetNode.type === 'Frame') {
      // Check if this specific port already has a connection
      const portHasConnection = this.connections.some(c => c.fromId === sourceNode.id && c.fromPort === this.connectingSourcePort);
      
      if (portHasConnection) {
        alert(`The ${this.connectingSourcePort} port already has a connection.`);
        isValid = false;
      } else {
        isValid = true;
        // Assign frameRole based on the chosen port
        targetNode.frameRole = this.connectingSourcePort === 'Request' ? 'Request' : 'Ack';
      }
    }
    
    if (sourceNode.type === 'Frame' && (targetNode.type === 'Frame' || targetNode.type === 'Field' || targetNode.type === 'Ack Field')) isValid = true;

    // Additional rule: Service only receives from Root
    if (targetNode.type === 'Service' && sourceNode.type !== 'Root') isValid = false;

    if (isValid) {
      const exists = this.connections.some(c => c.fromId === sourceNode.id && c.toId === targetNode.id && c.fromPort === this.connectingSourcePort);
      if (!exists) {
        this.connections.push({
          id: Math.random().toString(36).substr(2, 9),
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

  getConnectionCoords(conn: Connection) {
    const from = this.nodes.find(n => n.id === conn.fromId);
    const to = this.nodes.find(n => n.id === conn.toId);
    if (!from || !to) return { x1: 0, y1: 0, x2: 0, y2: 0 };

    let y1Offset = 40; // Default center (80px / 2)
    
    // Specialized ports only for Service nodes
    if (from.type === 'Service') {
      if (conn.fromPort === 'Request') y1Offset = 20;
      else if (conn.fromPort === 'Ack') y1Offset = 60;
    }

    return {
      x1: from.x + 180, // Right edge
      y1: from.y + y1Offset,
      x2: to.x,         // Left edge
      y2: to.y + 40     // Always center left
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

  getTempConnectionCoords() {
    if (!this.connectingSourceNodeId) return null;
    const from = this.nodes.find(n => n.id === this.connectingSourceNodeId);
    if (!from) return null;

    let y1Offset = 40;
    if (from.type === 'Service') {
      if (this.connectingSourcePort === 'Request') y1Offset = 20;
      else if (this.connectingSourcePort === 'Ack') y1Offset = 60;
    }

    return {
      x1: from.x + 180,
      y1: from.y + y1Offset,
      x2: this.mousePosition.x,
      y2: this.mousePosition.y
    };
  }

  deleteNode(nodeId: string) {
    this.nodes = this.nodes.filter(n => n.id !== nodeId);
    this.connections = this.connections.filter(c => c.fromId !== nodeId && c.toId !== nodeId);
    if (this.selectedNode?.id === nodeId) this.selectedNode = null;
    this.markModified();
  }

  deleteConnection(connId: string) {
    this.connections = this.connections.filter(c => c.id !== connId);
    this.markModified();
  }

  markModified() {
    this.isModified = true;
  }

  saveChanges() {
    console.log('Saving changes...', { nodes: this.nodes, connections: this.connections });
    this.isModified = false;
  }

  exportProtocol() {
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
    console.log('Protocol exported successfully');
  }

  importProtocol() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e: any) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.nodes && data.connections) {
            this.nodes = data.nodes;
            this.connections = data.connections;
            this.protocolName = data.protocolName || this.protocolName;
            this.version = data.version || this.version;
            this.markModified();
            console.log('Protocol imported successfully');
          } else {
            alert('Invalid protocol design file');
          }
        } catch (err) {
          console.error('Error parsing protocol file', err);
          alert('Error importing protocol design');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  exitDesigner() {
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
  onBeforeUnload(event: BeforeUnloadEvent) {
    if (this.isModified) {
      event.returnValue = 'You have unsaved changes.';
      return 'You have unsaved changes.';
    }
    return undefined;
  }

  // View Controls
  zoomIn() {
    this.zoomLevel = Math.min(this.zoomLevel + 0.1, 2.0);
  }

  zoomOut() {
    this.zoomLevel = Math.max(this.zoomLevel - 0.1, 0.2);
  }

  fitScreen() {
    if (this.nodes.length === 0) {
      this.zoomLevel = 1.0;
      this.canvasOffset = { x: 0, y: 0 };
      return;
    }

    const padding = 50;
    const minX = Math.min(...this.nodes.map(n => n.x));
    const minY = Math.min(...this.nodes.map(n => n.y));
    const maxX = Math.max(...this.nodes.map(n => n.x + 180));
    const maxY = Math.max(...this.nodes.map(n => n.y + 80));

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

  toggleGrid() {
    this.isSnapGridEnabled = !this.isSnapGridEnabled;
  }

  getZoomPercentage(): number {
    return Math.round(this.zoomLevel * 100);
  }
}
