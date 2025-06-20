import { test, expect } from '@playwright/test';

test('Actualizar el estado de comprado en la tabla', async ({ page }) => {
  // Navegar a la aplicación
  await page.goto('/');

  // Hacer clic en "Ver Lista"
  await page.click('button:has-text("Ver Lista")');

  // Esperar a que la tabla cargue
  await page.waitForSelector('table');

  // Seleccionar el primer producto en la columna "Comprado" y cambiar de "No" a "Sí"
  const dropdown = page.locator('tbody tr:first-child select');
  await dropdown.selectOption({ label: 'Sí' });

  // Verificar que el valor cambió a "Sí"
  await expect(dropdown).toHaveValue('Sí');

  // Opcional: Verificar que el cambio se refleje en el backend (si es posible)
});