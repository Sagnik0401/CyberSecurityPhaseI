export function startSimulationLoop(onTick, tickMs) {
  const handle = window.setInterval(() => {
    onTick()
  }, tickMs)

  return () => {
    window.clearInterval(handle)
  }
}
