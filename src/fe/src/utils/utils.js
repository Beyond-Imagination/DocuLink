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

export { getLinkColor };
