/**
 * Utility per gestire correttamente il viewport height su dispositivi mobili
 * Risolve il problema di iOS Safari con le barre del browser
 */

export function setViewportHeight() {
	// Calcola l'altezza reale del viewport
	const vh = window.innerHeight * 0.01;
	// Imposta la variabile CSS custom
	document.documentElement.style.setProperty('--vh', `${vh}px`);

	// Calcola anche la larghezza per sicurezza
	const vw = window.innerWidth * 0.01;
	document.documentElement.style.setProperty('--vw', `${vw}px`);
}

export function initViewportHeight() {
	// Imposta inizialmente
	setViewportHeight();

	// Aggiorna su resize (con debounce per performance)
	let resizeTimeout: number;

	window.addEventListener('resize', () => {
		clearTimeout(resizeTimeout);
		resizeTimeout = window.setTimeout(() => {
			setViewportHeight();
		}, 100);
	});

	// Aggiorna anche su orientationchange per dispositivi mobili
	window.addEventListener('orientationchange', () => {
		// Timeout più lungo per orientationchange perché il browser impiega tempo ad aggiornare
		setTimeout(() => {
			setViewportHeight();
		}, 500);
	});
}
