'use client'

import { StyledTable, StyledTableWrapper } from './MdxTable.styles'

export function MdxTable({
  children,
  ...props
}: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <StyledTableWrapper>
      <StyledTable {...props}>{children}</StyledTable>
    </StyledTableWrapper>
  )
}
