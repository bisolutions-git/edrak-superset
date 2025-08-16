/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
/* eslint-disable react-prefer-function-component/react-prefer-function-component */
// eslint-disable-next-line no-restricted-syntax
import React from 'react';
import { theme as antdThemeImport, ConfigProvider } from 'antd';

// @fontsource/* v5.1+ doesn't play nice with eslint-import plugin v2.31+
/* eslint-disable import/extensions */
import '@fontsource/inter/200.css';
/* eslint-disable import/extensions */
import '@fontsource/inter/400.css';
/* eslint-disable import/extensions */
import '@fontsource/inter/500.css';
/* eslint-disable import/extensions */
import '@fontsource/inter/600.css';
/* eslint-disable import/extensions */
import '@fontsource/fira-code/400.css';
/* eslint-disable import/extensions */
import '@fontsource/fira-code/500.css';
/* eslint-disable import/extensions */
import '@fontsource/fira-code/600.css';

import {
  ThemeProvider,
  CacheProvider as EmotionCacheProvider,
} from '@emotion/react';
import createCache from '@emotion/cache';
import { noop } from 'lodash';
import { GlobalStyles } from './GlobalStyles';

import {
  AntdThemeConfig,
  AnyThemeConfig,
  SerializableThemeConfig,
  SupersetTheme,
  allowedAntdTokens,
  SharedAntdTokens,
  DeprecatedThemeColors,
} from './types';

import {
  normalizeThemeConfig,
  serializeThemeConfig,
  getSystemColors,
  getDeprecatedColors,
} from './utils';

/* eslint-disable theme-colors/no-literal-colors */

export class Theme {
  theme: SupersetTheme;

  // Light theme colors
  private static readonly lightTokens = {
    colorPrimary: '#051556',        // Main brand color - deep navy
    colorLink: '#1622b7',           // Links - rich blue
    colorSuccess: '#1ed3b9',        // Success - teal from your palette
    colorInfo: '#5e4ef9',           // Info - vibrant purple
    colorText: '#051556',           // Main text color - your brand navy
    colorTextSecondary: '#1622b7',  // Secondary text - rich blue
    colorBgElevated: '#e6e4f2',     // Light lavender for elevated surfaces
    colorBorder: '#d1aaf2',         // Soft lavender for borders
  };

  // Dark theme colors
  private static readonly darkTokens = {
    colorPrimary: '#9a9afc',        // Light purple for dark theme
    colorLink: '#9a9afc',           // Light purple for links in dark theme
    colorSuccess: '#1ed3b9',        // Keep teal - works on dark
    colorInfo: '#9a9afc',           // Light purple for info
    colorText: '#e6e4f2',           // Light lavender text on dark
    colorTextSecondary: '#d1aaf2',  // Soft lavender for secondary text
    colorBgElevated: '#1622b7',     // Rich blue for elevated surfaces
    colorBorder: '#5e4ef9',         // Vibrant purple for borders
  };

  private static readonly defaultTokens = {
    // Brand
    brandLogoAlt: 'Edrak Analytics',
    brandLogoUrl: '/static/assets/images/edrak/edrak-logo-horizon.png',
    brandLogoMargin: '12px',
    brandLogoHref: '/',
    brandLogoHeight: '30px',

    // Default colors (will be overridden by theme-specific tokens)
    colorError: '#e04355',          // Keep existing red for errors
    colorWarning: '#fcc700',        // Keep existing yellow for warnings

    // Forcing some default tokens
    fontFamily: `'Inter', Helvetica, Arial`,
    fontFamilyCode: `'Fira Code', 'Courier New', monospace`,

    // Extra tokens
    transitionTiming: 0.3,
    brandIconMaxWidth: 60,
    fontSizeXS: '8',
    fontSizeXXL: '28',
    fontWeightNormal: '400',
    fontWeightLight: '300',
    fontWeightStrong: 500,
  };

  private antdConfig: AntdThemeConfig;

  /**
   * Check if a theme configuration uses dark algorithm
   */
  private isDarkTheme(config: AntdThemeConfig): boolean {
    const { algorithm } = config;
    
    if (Array.isArray(algorithm)) {
      return algorithm.includes(antdThemeImport.darkAlgorithm);
    }
    
    return algorithm === antdThemeImport.darkAlgorithm;
  }

  private constructor({ config }: { config?: AnyThemeConfig }) {
    this.SupersetThemeProvider = this.SupersetThemeProvider.bind(this);

    // Create a new config object with default tokens
    const newConfig: AnyThemeConfig = config ? { ...config } : {};

    // Ensure token property exists with defaults
    newConfig.token = {
      ...Theme.defaultTokens,
      ...(config?.token || {}),
    };

    this.setConfig(newConfig);
  }

  /**
   * Create a theme from any theme configuration
   * Automatically handles both AntdThemeConfig and SerializableThemeConfig
   * If simple tokens are provided as { token: {...} }, they will be applied with defaults
   * If no config is provided, uses default tokens
   * Dark mode can be set via the algorithm property in the config
   */
  static fromConfig(config?: AnyThemeConfig): Theme {
    return new Theme({ config });
  }

  private static getFilteredAntdTheme(
    antdConfig: AntdThemeConfig,
  ): SharedAntdTokens {
    // This method generates all antd tokens and filters out the ones not allowed
    // in Superset
    const theme = Theme.getAntdTokens(antdConfig);
    return Object.fromEntries(
      allowedAntdTokens.map(key => [key, (theme as Record<string, any>)[key]]),
    ) as SharedAntdTokens;
  }

  private static getAntdTokens(
    antdConfig: AntdThemeConfig,
  ): Record<string, any> {
    return antdThemeImport.getDesignToken(antdConfig);
  }

  /**
   * Update the theme using any theme configuration
   * Automatically handles both AntdThemeConfig and SerializableThemeConfig
   * Dark mode should be specified via the algorithm property in the config
   */
  setConfig(config: AnyThemeConfig): void {
    const antdConfig = normalizeThemeConfig(config);

    // Determine if this is a dark theme
    const isDark = this.isDarkTheme(antdConfig);
    
    // Apply theme-specific brand colors based on dark/light mode
    const themeSpecificTokens = isDark ? Theme.darkTokens : Theme.lightTokens;

    // Apply default tokens to token property
    antdConfig.token = {
      ...Theme.defaultTokens,
      ...themeSpecificTokens,
      ...(antdConfig.token || {}),
    };

    // First phase: Let Ant Design compute the tokens
    const tokens = Theme.getFilteredAntdTheme(antdConfig);

    // Set the base theme properties
    this.antdConfig = antdConfig;
    this.theme = {
      ...Theme.defaultTokens,
      ...themeSpecificTokens,
      ...antdConfig.token, // Passing through the extra, superset-specific tokens
      ...tokens,
      colors: {} as DeprecatedThemeColors, // Placeholder that will be filled in the second phase
    };

    // Second phase: Now that theme is initialized, we can determine if it's dark
    // and generate the legacy colors correctly
    const systemColors = getSystemColors(tokens);
    this.theme.colors = getDeprecatedColors(systemColors, isDark);

    // Update the providers with the fully formed theme
    this.updateProviders(
      this.theme,
      this.antdConfig,
      createCache({ key: 'superset' }),
    );
  }

  /**
   * Export the current theme as a serializable configuration
   */
  toSerializedConfig(): SerializableThemeConfig {
    return serializeThemeConfig(this.antdConfig);
  }

  toggleDarkMode(isDark: boolean): void {
    // Create a new config based on the current one
    const newConfig = { ...this.antdConfig };

    // Determine the new algorithm based on isDark
    const newAlgorithm = isDark
      ? antdThemeImport.darkAlgorithm
      : antdThemeImport.defaultAlgorithm;

    // Handle the case where algorithm is an array
    if (Array.isArray(newConfig.algorithm)) {
      // Filter out any existing dark/default algorithms
      const otherAlgorithms = newConfig.algorithm.filter(
        alg =>
          alg !== antdThemeImport.darkAlgorithm &&
          alg !== antdThemeImport.defaultAlgorithm,
      );

      // Add the new algorithm to the front of the array
      newConfig.algorithm = [newAlgorithm, ...otherAlgorithms];
    } else {
      // Simple case: just replace the algorithm
      newConfig.algorithm = newAlgorithm;
    }

    // Update the theme with the new configuration
    this.setConfig(newConfig);
  }

  json(): string {
    return JSON.stringify(serializeThemeConfig(this.antdConfig), null, 2);
  }

  private updateProviders(
    theme: SupersetTheme,
    antdConfig: AntdThemeConfig,
    emotionCache: any,
  ): void {
    noop(theme, antdConfig, emotionCache);
    // Overridden at runtime by SupersetThemeProvider using setThemeState
  }

  SupersetThemeProvider({ children }: { children: React.ReactNode }) {
    if (!this.theme || !this.antdConfig) {
      throw new Error('Theme is not initialized.');
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [themeState, setThemeState] = React.useState({
      theme: this.theme,
      antdConfig: this.antdConfig,
      emotionCache: createCache({ key: 'superset' }),
    });

    this.updateProviders = (theme, antdConfig, emotionCache) => {
      setThemeState({ theme, antdConfig, emotionCache });
    };

    return (
      <EmotionCacheProvider value={themeState.emotionCache}>
        <ThemeProvider theme={themeState.theme}>
          <GlobalStyles />
          <ConfigProvider theme={themeState.antdConfig}>
            {children}
          </ConfigProvider>
        </ThemeProvider>
      </EmotionCacheProvider>
    );
  }
}

/* eslint-enable theme-colors/no-literal-colors */
