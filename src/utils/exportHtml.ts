import { Region, OrgNode } from '../types';
import { getDepartment, getDepartmentColor } from './department';
import { getLevelColor } from './colors';

// Count all subordinates recursively
const countAllSubordinates = (node: OrgNode): number => {
  if (!node.children || node.children.length === 0) {
    return 0;
  }
  let count = 0;
  node.children.forEach(child => {
    count += 1; // Count direct subordinate
    count += countAllSubordinates(child); // Count indirect subordinates
  });
  return count;
};

// Render a single node to HTML
const renderNodeToHtml = (node: OrgNode, level: number = 0): string => {
  const hasChildren = node.children && node.children.length > 0;
  const department = getDepartment(node);
  const departmentColor = department ? getDepartmentColor(department) : '#666';
  const subordinateCount = countAllSubordinates(node);
  const color = getLevelColor(level);
  const gradientStyle = `linear-gradient(135deg, ${color.from} 0%, ${color.to} 100%)`;
  const nodeId = `node-${node.id.replace(/[^a-zA-Z0-9]/g, '-')}`;
  
  let html = `
    <div class="org-node-wrapper" style="margin: 0 10px;">
      <div class="org-node-container">
        ${department ? `<div class="department-label" style="color: ${departmentColor};">${department.toUpperCase()}</div>` : ''}
        <div class="org-node" style="background: ${gradientStyle};" id="${nodeId}">
          <div class="node-content">
            <div class="node-name">
              ${node.name}${subordinateCount > 0 ? ` <span class="node-subordinate-count">(${subordinateCount})</span>` : ''}
            </div>
            <div class="node-position">${node.position}</div>
            ${node.notes ? `<div class="node-notes">${node.notes}</div>` : ''}
          </div>
        </div>
        ${hasChildren ? `<button class="expand-btn" onclick="toggleChildren('${nodeId}')">−</button>` : ''}
      </div>
      
      ${hasChildren ? `
        <div class="org-node-children" id="children-${nodeId}">
          ${node.children!.map(child => renderNodeToHtml(child, level + 1)).join('')}
        </div>
      ` : ''}
    </div>
  `;
  
  return html;
};

// Render a region to HTML
const renderRegionToHtml = (region: Region): string => {
  return `
    <div class="region-section">
      <h2 class="region-title">${region.name}</h2>
      <div class="org-chart-tree">
        ${renderNodeToHtml(region.orgData, 0)}
      </div>
    </div>
  `;
};

// Generate complete HTML document
export const exportToHtml = (regions: Region[]): string => {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Organization Chart Export</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      background: #f5f5f5;
      padding: 20px;
      color: #333;
    }
    
    .export-header {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .export-header h1 {
      font-size: 24px;
      margin-bottom: 10px;
    }
    
    .export-date {
      color: #666;
      font-size: 14px;
    }
    
    .region-section {
      background: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
    
    .region-title {
      font-size: 20px;
      margin-bottom: 20px;
      color: #333;
      border-bottom: 2px solid #4a90e2;
      padding-bottom: 10px;
    }
    
    .org-chart-tree {
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 200px;
    }
    
    .org-node-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      margin: 0 10px;
    }
    
    .org-node-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .org-node {
      border-radius: 8px;
      padding: 16px 20px;
      min-width: 200px;
      max-width: 250px;
      transition: all 0.3s ease;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: relative;
      color: white;
      margin-bottom: 20px;
    }
    
    .org-node:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
    
    .node-content {
      text-align: center;
    }
    
    .node-name {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 6px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }
    
    .node-subordinate-count {
      font-size: 14px;
      font-weight: 500;
      opacity: 0.9;
    }
    
    .node-position {
      font-size: 13px;
      opacity: 0.95;
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .department-label {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 8px;
      text-align: center;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }
    
    .node-notes {
      font-size: 11px;
      opacity: 0.75;
      margin-top: 6px;
      font-style: italic;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    .expand-btn {
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 24px;
      height: 24px;
      border: none;
      border-radius: 50%;
      background: white;
      color: #667eea;
      cursor: pointer;
      font-size: 18px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      transition: all 0.2s;
      z-index: 5;
    }
    
    .expand-btn:hover {
      background: #667eea;
      color: white;
      transform: translateX(-50%) scale(1.1);
    }
    
    .org-node-children {
      display: flex;
      flex-direction: column;
      align-items: center;
      position: relative;
      padding-top: 20px;
      margin-top: 10px;
      gap: 20px;
    }
    
    .org-node-children.collapsed {
      display: none;
    }
    
    .org-node-children::before {
      content: '';
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 2px;
      height: 20px;
      background: #ddd;
      z-index: 1;
    }
    
    .connector-line {
      position: absolute;
      top: -20px;
      left: 50%;
      width: 2px;
      height: 20px;
      background: #ddd;
      transform: translateX(-50%);
      z-index: 1;
    }
    
    @media print {
      body {
        background: white;
        padding: 10px;
      }
      
      .org-node-children {
        display: flex !important;
      }
      
      .expand-btn {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="export-header">
    <h1>Organization Chart</h1>
    <div class="export-date">Exported on: ${new Date().toLocaleString()}</div>
  </div>
  
  ${regions.map(region => renderRegionToHtml(region)).join('')}
  
  <script>
    function toggleChildren(nodeId) {
      const childrenDiv = document.getElementById('children-' + nodeId);
      const btn = event.target;
      
      if (childrenDiv) {
        if (childrenDiv.classList.contains('collapsed')) {
          childrenDiv.classList.remove('collapsed');
          btn.textContent = '−';
        } else {
          childrenDiv.classList.add('collapsed');
          btn.textContent = '+';
        }
      }
    }
  </script>
</body>
</html>`;
  
  return html;
};

// Download HTML file
export const downloadHtml = (regions: Region[]): void => {
  const html = exportToHtml(regions);
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `organization-chart-${new Date().toISOString().split('T')[0]}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

