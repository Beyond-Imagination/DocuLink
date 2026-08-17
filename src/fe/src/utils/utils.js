const getLinkColor = (type) => {
  if (type === 'keyword') {
    return '#F77575'
  } else if (type === 'hierarchy') {
    return '#62A4FF';
  } else if (type === 'labels') {
    return '#FAEB40';
  } else if (type === 'rovo') {
    return '#42E45A';
  }
  return '#C273FF';
};

const formatDate = (value) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

const expandMembership = (membership, type) => {
  const links = [];
  const seen = new Set();

  for (const ids of Object.values(membership ?? {})) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        // 두 페이지가 키워드나 라벨을 여럿 공유하면 같은 엣지가 반복된다
        const pair = `${ids[i]}|${ids[j]}`;

        if (!seen.has(pair)) {
          seen.add(pair);
          links.push({ source: ids[i], target: ids[j], type });
        }
      }
    }
  }

  return links;
};

const expandHierarchy = (nodes = []) => {
  const ids = new Set(nodes.map((node) => node.id));

  return nodes
    .filter((node) => node.parentId && ids.has(node.parentId))
    .map((node) => ({ source: node.parentId, target: node.id, type: 'hierarchy' }));
};

export { getLinkColor, formatDate, expandMembership, expandHierarchy };
