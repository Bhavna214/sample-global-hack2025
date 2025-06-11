export const generateConfig = (app_name, app_description, nodes, edges) => {
  const typeCounts = {};
  const transformedNodes = nodes.map(node => {
    typeCounts[node.type] = (typeCounts[node.type] || 0) + 1;
    const formattedId = `${node.type}_${typeCounts[node.type]}`;
    const props = (node.data.fields || []).reduce((acc, field) => {
      // Handle different field types
      switch (field.type) {
        case 'file':
          acc[field.label] = field.value ? {
            name: field.value.name,
            type: field.value.type,
            size: field.value.size,
            lastModified: field.value.lastModified,
            content: field.value.content || null
          } : null;
          break;
        case 'number':
          // Convert to number if possible
          acc[field.label] = field.value ? Number(field.value) : null;
          break;
        case 'boolean':
          // Convert to boolean
          acc[field.label] = field.value === 'true' || field.value === true;
          break;
        case 'array':
          // Handle array type fields
          acc[field.label] = Array.isArray(field.value) ? field.value : 
                           (typeof field.value === 'string' ? field.value.split(',') : []);
          break;
        default:
          // For text and other types, store as is
          acc[field.label] = field.value || '';
      }
      return acc;
    }, {});

    return {
      id: formattedId,
      type: node.type,
      props
    };
  });

  const idMapping = nodes.reduce((acc, node, index) => {
    acc[node.id] = transformedNodes[index].id;
    return acc;
  }, {});

  const transformedEdges = edges.map(edge => ({
    source: idMapping[edge.source],
    target: idMapping[edge.target]
  }));

  const config = {
    app_name,
    app_description,
    connections: {
      nodes: transformedNodes,
      edges: transformedEdges
    }
  };

  return config;
}; 
