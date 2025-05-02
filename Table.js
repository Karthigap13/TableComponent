import { NoDataComponent } from './noDataComponent.js';

export class TableComponent {
  constructor(data, columns , wrapperId) {
    this.data = data;
    this.columns = columns;
    this.filteredData = data;
    this.rowHeight = 50;
    this.bufferSize = 5;
    this.currentSort = { key: null, direction: 'asc' };
    this.wrapperId = wrapperId; 
    this.filterInput = document.getElementById("filterInput");
  }

  init() {
    // Create container elements
    this.tableContainer = document.createElement("div");
    this.tableContainer.classList.add("table-container");

    this.tableHeader = document.createElement("div");
    this.tableHeader.classList.add("header");
    this.tableContainer.appendChild(this.tableHeader);

    this.scrollContainer = document.createElement("div");
    this.scrollContainer.classList.add("table");
    this.tableContainer.appendChild(this.scrollContainer);

    this.tableBody = document.createElement("div");
    this.tableBody.classList.add("body");
    this.scrollContainer.appendChild(this.tableBody);

    // Append to wrapper by this.wrapperId
    const wrapper = document.getElementById(this.wrapperId);
    if (wrapper) {
      wrapper.appendChild(this.tableContainer);
    } else {
      console.error(`Wrapper with id "${this.wrapperId}" not found.`);
    }

    this.createHeader();
    this.attachEvents();
    this.renderVisibleRows();
  }

  createHeader() {
    this.columns.forEach((col, index) => {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (col.width) {
        cell.style.width = col.width;
      }
      cell.textContent = col.label;
      if (col.sortable) {
        cell.classList.add("sort-header");
        cell.setAttribute("data-key", col.key);
        const sortIcon = document.createElement("span");
        sortIcon.classList.add("sort-icon");
        sortIcon.textContent = col.sortIcons?.default || '↕';
        cell.appendChild(sortIcon);
      }

      if (col.customSortRanges) {
        const select = document.createElement("select");
        select.classList.add("custom-sort-dropdown");
        col.customSortRanges.forEach(range => {
          const option = document.createElement("option");
          option.value = range;
          option.textContent = range;
          select.appendChild(option);
        });
        select.addEventListener("change", (e) => {
          this.handleCustomSort(e.target.value);
        });
        cell.appendChild(select);
      }

      if (index < this.columns.length - 1) {
        const resizer = document.createElement("div");
        resizer.classList.add("resizer");
        resizer.addEventListener("mousedown", (e) => this.initResize(e, cell));
        cell.appendChild(resizer);
      }
     this.tableHeader.appendChild(cell);
    });
  }

  initResize(e, cell) {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = cell.offsetWidth;
    const index = Array.from(cell.parentNode.children).indexOf(cell);
    const onMouseMove = (e) => {
      const newWidth = startWidth + (e.clientX - startX);
      cell.style.width = `${newWidth}px`;
      this.columns[index].width = `${newWidth}px`;
      document.querySelectorAll(`.row`).forEach(row => {
        row.children[index].style.width = `${newWidth}px`;
      });
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  attachEvents() {
    this.scrollContainer.addEventListener("scroll", () => this.renderVisibleRows());  // On scroll, re-render the visible rows based on current scroll position
    this.filterInput.addEventListener("input", this.debounce((e) => this.handleFilter(e.target.value), 300));  // triggers the handleFilter method after a 300ms debounce delay.
    this.tableHeader.addEventListener("click", (e) => {
      if (e.target.classList.contains("sort-icon")) {
        const header = e.target.closest(".sort-header");   //Finds the nearest parent element with the class sort-header.
        if (header) {
          const key = header.getAttribute("data-key");
          if (this.currentSort.key === key) {          // If user clicks the same column header, toggle the sort direction
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
          } else {
            this.currentSort.key = key;
            this.currentSort.direction = 'asc';
          }
          this.updateSortIcons();
          this.sortData();
          this.renderVisibleRows();    // After sorting, re-render the visible rows to reflect the new sorted data
        }
      }
    });
  }

  handleFilter(query) {
    this.filteredData = this.data.filter((item) => {
    return this.columns.some((col) => {
    if (col.filterable) {
         return item[col.key].toLowerCase().includes(query.toLowerCase());
      }
    return false;
    });
    });

    if (this.filteredData.length === 0) {
      const noDataComponent = new NoDataComponent();
      this.tableBody.appendChild(noDataComponent.getElement());
      return;
    }

    this.renderVisibleRows();
  }

  sortData() {
    const { key, direction } = this.currentSort;
    if (!key) return;
    const dir = direction === 'asc' ? 1 : -1;
    this.filteredData.sort((a, b) => {
      if (typeof a[key] === 'number' && typeof b[key] === 'number') {
        return (a[key] - b[key]) * dir;
      } else if (!isNaN(Date.parse(a[key])) && !isNaN(Date.parse(b[key]))) {
        return (new Date(a[key]) - new Date(b[key])) * dir;
      } else {
        return a[key].toString().toLowerCase().localeCompare(b[key].toString().toLowerCase()) * dir;
      }
    });
  }

  updateSortIcons() {
    this.tableHeader.querySelectorAll(".sort-header").forEach(header => {
      const icon = header.querySelector(".sort-icon");
      const key = header.getAttribute("data-key");
      const colConfig = this.columns.find(col => col.key === key);
      if (!colConfig || !colConfig.sortIcons) return;

      if (key === this.currentSort.key) {
        icon.textContent = this.currentSort.direction === 'asc'
          ? colConfig.sortIcons.asc
          : colConfig.sortIcons.desc;
      } else {
        icon.textContent = colConfig.sortIcons.default;
      }
    });
  }

  debounce(fn, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  handleCustomSort(range) {
    const isAll = range === 'All';
    const [start, end] = isAll ? [] : range.split('-').map(Number);

    this.filteredData = this.data.filter(item => {
      const year = new Date(item.joined).getFullYear();
      return isAll || (year >= start && year <= end);
    }).sort((a, b) => new Date(a.joined) - new Date(b.joined));

    this.renderVisibleRows();
  }

  createRow(row) {
    let rowDiv = document.createElement("div");
    rowDiv.classList.add ("row");

    this.columns.forEach(col => {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      if (col.width) {
        cell.style.width = col.width;
      }
      if (typeof col.render === "function") {
        const rendered = col.render(row[col.key]);
        cell.appendChild(rendered);
      } else {
        cell.textContent = row[col.key];
      }
      rowDiv.appendChild(cell);
    });
    return rowDiv;
  }

  renderVisibleRows() {
    const scrollTop = this.scrollContainer.scrollTop;    // Get how far we've scrolled down inside the table body
    const containerHeight = this.scrollContainer.clientHeight;     // Get visible container height (viewport height of the scrollable area)

    const startIndex = Math.max(0, Math.floor(scrollTop / this.rowHeight) - this.bufferSize);
    const endIndex = Math.min(this.filteredData.length, Math.ceil((scrollTop + containerHeight) / this.rowHeight) + this.bufferSize);
    this.tableBody.style.transform = `translateY(${startIndex * this.rowHeight}px)`;   // Move the tableBody container down by (startIndex * rowHeight) pixels

    const visibleData = this.filteredData.slice(startIndex, endIndex);
    const existingRows = Array.from(this.tableBody.children);   // Get all existing row elements inside the table body

    visibleData.forEach((dataItem, i) => {
      let row;
      if (existingRows[i]) {
        row = existingRows[i];
        row.style.display = 'flex';
      } else {
        row = this.createRow(dataItem);
        this.tableBody.appendChild(row);
      }

      this.columns.forEach((col, colIndex) => {
        const cell = row.children[colIndex];
        if (typeof col.render === "function") {
          const rendered = col.render(dataItem[col.key]);
          cell.textContent = '';
          cell.appendChild(rendered);
        } else {
          cell.textContent = dataItem[col.key];
        }
      });
    });

    for (let i = visibleData.length; i < existingRows.length; i++) {    // Hide any extra rows that aren't needed now
      existingRows[i].style.display = 'none';
    }
  }
}
