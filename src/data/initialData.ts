import { OrgNode } from '../types';

// Initial data created based on image description
export const initialOrgData: OrgNode = {
  id: 'root',
  name: 'Kevin Yam',
  position: 'Branch Manager',
  children: [
    {
      id: 'carmen-he',
      name: 'Carmen He',
      position: 'Operations Manager',
      children: [
        {
          id: 'jeffrey-tsai',
          name: 'Jeffrey Tsai',
          position: 'Import Licensed Custom Broker',
          children: [
            {
              id: 'danny-chen',
              name: 'Danny Chen',
              position: 'Entry Writer',
              children: [
                {
                  id: 'john-chen',
                  name: 'John Chen',
                  position: 'Entry Writer',
                  children: [
                    {
                      id: 'donovan-valeriano',
                      name: 'Donovan Valeriano',
                      position: 'Entry Writer',
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              id: 'michael-julao',
              name: 'Michael Julao',
              position: 'Export & Compliance Manager',
              children: [
                {
                  id: 'amy-zhang',
                  name: 'Amy Zhang',
                  position: 'Air Export',
                  children: [
                    {
                      id: 'sue-zhao',
                      name: 'Sue Zhao',
                      position: 'Air Export',
                      children: []
                    }
                  ]
                },
                {
                  id: 'senita-salcic',
                  name: 'Senita Salcic',
                  position: 'Air Import',
                  children: []
                },
                {
                  id: 'victor-szeto',
                  name: 'Victor Szeto',
                  position: 'Ocean Import',
                  children: []
                }
              ]
            }
          ]
        },
        {
          id: 'quenny-qu',
          name: 'Quenny Qu',
          position: 'E-Comm Manager',
          children: [
            {
              id: 'troy-walter',
              name: 'Troy Walter',
              position: 'E-Comm Supervisor',
              children: [
                {
                  id: 'lizbeth-gutierrez',
                  name: 'Lizbeth Gutierrez',
                  position: 'Inbound',
                  children: [
                    {
                      id: 'delia-flores',
                      name: 'Delia Flores',
                      position: 'Inbound',
                      children: []
                    },
                    {
                      id: 'jeanette-liu',
                      name: 'Jeanette Liu',
                      position: 'Inbound',
                      children: []
                    },
                    {
                      id: 'yesenia-andres',
                      name: 'Yesenia Andres',
                      position: '(Gemini) Inbound',
                      children: []
                    }
                  ]
                },
                {
                  id: 'ryan-zhou',
                  name: 'Ryan Zhou',
                  position: 'Outbound',
                  children: [
                    {
                      id: 'mohammed-fardeen',
                      name: 'Mohammed Fardeen',
                      position: 'Outbound',
                      children: []
                    },
                    {
                      id: 'jason-valeriano',
                      name: 'Jason Valeriano',
                      position: 'Outbound 12/27 on board',
                      children: []
                    }
                  ]
                }
              ]
            },
            {
              id: 'peter-huang',
              name: 'Peter Huang',
              position: 'E-comm Tech Coordinator',
              children: [
                {
                  id: 'johnathan-lim',
                  name: 'Johnathan Lim',
                  position: 'Consol project OP',
                  children: []
                }
              ]
            }
          ]
        },
        {
          id: 'samuel-ho',
          name: 'Samuel Ho',
          position: 'Warehouse Manager',
          children: [
            {
              id: 'alex-words',
              name: 'Alex Words',
              position: 'Supervisor',
              children: [
                {
                  id: 'jeremiah-rodriguez',
                  name: 'Jeremiah Rodriguez',
                  position: '(Gemini) Supervisor',
                  children: []
                }
              ]
            }
          ]
        },
        {
          id: 'charlie-yii',
          name: 'Charlie Yii',
          position: 'Warehouse Manager',
          children: [
            {
              id: 'chris-southerland',
              name: 'Chris Southerland',
              position: '(Gemini) Supervisor',
              children: []
            }
          ]
        }
      ]
    }
  ]
};

