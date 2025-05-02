import { TableComponent } from './Table.js';
import { columns } from './columns.js';
const fetchData = async () => {
    const response = await fetch("http://localhost:3000/users");
    const data = await response.json();
    console.log(data);  
    return data;
}

fetchData().then(data => {
    const table = new TableComponent(data, columns, "tableWrapper"); 
    table.init();  
});
