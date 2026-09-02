<script lang="ts">
  // Barra superior "de vidrio" con tilt 3D al pasar el mouse + responsive (en móvil
  // colapsa a solo-íconos). Los items son de ejemplo: reemplázalos por los de tu app.
  import { page } from '$app/state';

  let tiltX = $state(0);
  let tiltY = $state(0);

  function handleMove(e: MouseEvent) {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    const MAX = 1.2;
    tiltX = -ny * MAX;
    tiltY = nx * MAX;
  }
  function handleLeave() {
    tiltX = 0;
    tiltY = 0;
  }

  // Edita estos items por las secciones reales de tu app.
  const items = [
    { href: '/', label: 'Inicio' },
    { href: '/calendario', label: 'Calendario' },
    { href: '/guardarropa', label: 'Guardarropa' }
  ];
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<header
  class="topnav"
  style="transform: perspective(900px) rotateX({tiltX}deg) rotateY({tiltY}deg);"
  onmousemove={handleMove}
  onmouseleave={handleLeave}
>
  <a href="/" class="brand" aria-label="Inicio">
    <span class="brand-ico" aria-hidden="true"></span>
    <span class="brand-title">Guardaropa</span>
  </a>

  <nav class="topnav-nav">
    {#each items as it (it.href)}
      <a href={it.href} class="nav-item" aria-current={page.url.pathname === it.href ? 'page' : undefined}>
        <span class="nav-ico" aria-hidden="true"></span>
        <span class="nav-label">{it.label}</span>
      </a>
    {/each}
  </nav>
</header>

<style>
  .topnav {
    position: fixed;
    top: 1rem;
    left: 1rem;
    right: 1rem;
    height: var(--topnav-height, 64px);
    padding: 0 1.25rem;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    background: var(--glass-bg, rgba(255, 255, 255, 0.58));
    backdrop-filter: blur(10px) saturate(120%);
    -webkit-backdrop-filter: blur(10px) saturate(120%);
    border: 1px solid var(--glass-border, rgba(220, 38, 38, 0.3));
    border-radius: 16px;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.75),
      var(--glass-shadow, 0 4px 16px rgba(127, 29, 29, 0.14));
    transition: transform 0.18s ease-out;
    will-change: transform;
    user-select: none;
    z-index: 9;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    color: var(--ink, #18181b);
    text-decoration: none;
    border-radius: 8px;
    padding: 0.25rem 0.4rem;
    transition: background 0.18s ease;
  }
  .brand:hover {
    background: var(--red-soft, rgba(220, 38, 38, 0.1));
  }
  .brand-ico {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    flex-shrink: 0;
    background: linear-gradient(135deg, #ef4444, #b91c1c);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.45);
  }
  .brand-title {
    font-size: 1.2rem;
    font-weight: 600;
    letter-spacing: 0.005em;
  }

  .topnav-nav {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    margin-left: 1.25rem;
    padding-left: 1.25rem;
    border-left: 1px solid var(--glass-border, rgba(220, 38, 38, 0.3));
  }

  .nav-item {
    display: inline-flex;
    align-items: center;
    gap: 0.45rem;
    padding: 0.45rem 0.8rem;
    color: var(--ink-soft, rgba(24, 24, 27, 0.78));
    text-decoration: none;
    font-size: 0.9rem;
    border-radius: 8px;
    border: 1px solid transparent;
    transition: background 0.18s ease, border-color 0.18s ease, color 0.18s ease;
    white-space: nowrap;
  }
  .nav-item:hover {
    background: var(--red-soft, rgba(220, 38, 38, 0.1));
    border-color: rgba(220, 38, 38, 0.24);
    color: var(--ink, #18181b);
  }
  .nav-item[aria-current='page'] {
    color: #7f1d1d;
    font-weight: 600;
    background: rgba(220, 38, 38, 0.14);
    border-color: rgba(220, 38, 38, 0.45);
    box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.16) inset;
  }
  .nav-ico {
    width: 16px;
    height: 16px;
    border-radius: 5px;
    flex-shrink: 0;
    background: rgba(220, 38, 38, 0.45);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.35);
  }
  .nav-item[aria-current='page'] .nav-ico {
    background: var(--red, #dc2626);
  }

  /* En pantallas chicas: solo íconos (oculta texto y título) para que no se desborde. */
  @media (max-width: 680px) {
    .topnav {
      padding: 0 0.6rem;
    }
    .brand {
      gap: 0;
      padding: 0.25rem;
    }
    .brand-title {
      display: none;
    }
    .topnav-nav {
      margin-left: 0.5rem;
      padding-left: 0.5rem;
      gap: 0.1rem;
    }
    .nav-item {
      padding: 0.45rem 0.5rem;
    }
    .nav-label {
      display: none;
    }
  }
  @media (max-width: 360px) {
    .topnav {
      padding: 0 0.4rem;
    }
    .topnav-nav {
      margin-left: 0.35rem;
      padding-left: 0.35rem;
    }
    .nav-item {
      padding: 0.45rem 0.35rem;
    }
  }
</style>
