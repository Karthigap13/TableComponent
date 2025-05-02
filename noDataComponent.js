export class NoDataComponent {
    constructor(message = "No data found") {
      this.message = message;
      this.element = this.createElement();
    }
  
    createElement() {
      const noDataRow = document.createElement('div');
      noDataRow.classList.add('row');
      noDataRow.textContent = this.message;
      noDataRow.style.textAlign = 'center';
      noDataRow.style.padding = '10px';
      noDataRow.style.color = 'red';
      return noDataRow;
    }
  
    getElement() {
      return this.element;
    }
  }
  