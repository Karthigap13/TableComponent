export const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      filterable: true,
      width: '25%',
      dataType: 'string',
      sortIcons: {
        default: '↕',
        asc: '⬆️',
        desc: '⬇️'
      }
    },
    {
      key: 'age',
      label: 'Age',
      sortable: true,
      filterable: false,
      dataType: 'number',
      width: '10%', sortIcons: {
        default: '↕',
        asc: '⬆️',
        desc: '⬇️'
      }
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      filterable: true,
      dataType: 'string',
      width: '30%',
      sortIcons: {
        default: '↕',
        asc: '⬆️',
        desc: '⬇️'
      }
    },
    {
      key: 'joined',
      label: 'Joined',
      sortable: true,
      filterable: false,
      width: '20%',
      dataType: 'date',
      render: (value) => {
        const span = document.createElement('span');
        span.textContent = value;
  
        const date = new Date(value);
        if (date.getMonth() < 3) {
          span.style.color = 'blue'; 
        }
  
        return span;
      },
      sortIcons: {
        default: '↕',
        asc: '⬆️',
        desc: '⬇️'
      },
      customSortRanges: ['All', '2020-2023', '2023-2025']
    }
  ];
  