import styled from 'styled-components'

export const StyledPage = styled.main`
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 1rem 4rem;
  /* Shared reading measure: the post title, body prose and centred media line
     up on this centred column. A fixed rem (not ch) is deliberate — ch scales
     with each element's font-size, so headings and body would resolve to
     different widths and their left edges would not align. 40rem ≈ a ~66-char
     body line. */
  --reading-measure: 40rem;

  @media (width >= 1024px) {
    padding: 0 2rem 5rem;
  }
`
