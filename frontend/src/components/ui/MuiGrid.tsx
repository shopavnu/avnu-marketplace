import React from 'react';
import { Grid as MuiGrid, GridProps } from '@mui/material';

/**
 * Grid component wrapper for Material UI v5 Grid
 * This wrapper ensures compatibility with the new Grid API in MUI v5
 */
export const Grid: React.FC<GridProps> = (props) => {
  return <MuiGrid {...props} />;
};

export default Grid;
