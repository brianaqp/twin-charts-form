import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { CustomDatePipe } from '../../../pipes/custom-date.pipe';

@Component({
  selector: 'app-position-table',
  standalone: true,
  imports: [CommonModule, CustomDatePipe],
  templateUrl: './position-table.component.html',
})
export class PositionTableComponent {

  // Data
  data = input<any[]>([]);

  // Styles
  tableWidth = '1200px'
  table = {
      'border-collapse': 'collapse',
      'border': '1px solid black',
      'width': '$width',
      'max-width': `${this.tableWidth}`,

      'min-width': `${this.tableWidth}`,
      'height': '20px'
  }
  // Cell in body
  cb = {
      'font-size': '14px',
      'padding-left': '8px',
      'border': '1px solid black'
  }

  // cell in header
  ch = { 
      'background-color': 'gray',
      'color': 'white',
      'font-size': '16px',
      'padding-left': '8px',
      'border': '1px solid black'
  }
}
