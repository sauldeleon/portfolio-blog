import styled from 'styled-components'

export const StyledParticles = styled.div`
  @keyframes particle-movement {
    from {
      transform: translate(-50%, var(--begin-y));
    }
    to {
      transform: translate(50%, var(--end-y));
    }
  }

  @keyframes particle-fade {
    0% {
      opacity: 1;
    }

    50% {
      opacity: 0.7;
    }

    100% {
      opacity: 1;
    }
  }

  @keyframes particle-scale {
    0% {
      transform: scale3d(0.4, 0.4, 1);
    }

    50% {
      transform: scale3d(1, 1, 1);
    }

    100% {
      transform: scale3d(0.4, 0.4, 1);
    }
  }
`
