export const generateConfig = (nodes, edges) => {
  const typeCounts = {};
  const transformedNodes = nodes.map(node => {
    typeCounts[node.type] = (typeCounts[node.type] || 0) + 1;
    const formattedId = `${node.type}_${typeCounts[node.type]}`;
    const props = (node.data.fields || []).reduce((acc, field) => {
      acc[field.label] = field.value;
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
    app_name: "AutoArch AI",
    nodes: transformedNodes,
    edges: transformedEdges
  };

  return config;
}; 
