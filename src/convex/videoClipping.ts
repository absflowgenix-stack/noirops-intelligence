[esbuild] build START { entryPoints: [ '/project/vite.config.ts' ], external: 0, platform: 'node', bundle: true, format: 'esm' }
[esbuild] resolve#1 /project/vite.config.ts imp= kind=entry-point
[esbuild] resolve#2 path imp=/project/vite.config.ts kind=import-statement
[esbuild] build DONE 0.3s resolves=2 outputs=1 errors=0
[33mmanually calling optimizeDeps is deprecated. This is done automatically and does not need to be called manually.[39m
[esbuild] build START { entryPoints: undefined, external: 0, platform: undefined, bundle: true, format: 'esm' }
[esbuild] still bundling 3.0s resolves=0 loads=0
[esbuild] build DONE 4.4s resolves=0 outputs=1 errors=0
Failed to resolve dependency: [36mreact-router-dom[39m, present in client 'optimizeDeps.include'
Cannot optimize dependency: [36mconvex[39m, present in client 'optimizeDeps.include'
[32mOptimizing dependencies:
  [33m@convex-dev/auth/react, @radix-ui/react-dialog, @radix-ui/react-label, @radix-ui/react-scroll-area, @radix-ui/react-select, @radix-ui/react-separator, @radix-ui/react-slot, @radix-ui/react-tabs, @radix-ui/react-tooltip, @zumer/snapdom, class-variance-authority, clsx, convex/react, convex/server, date-fns, framer-motion, input-otp, lucide-react, next-themes, react, react-dom/client, react-router, react/jsx-dev-runtime, sonner, tailwind-merge, react/jsx-runtime, react-dom, @vly-ai/integrations, @radix-ui/react-dropdown-menu, @radix-ui/react-avatar, @radix-ui/react-popover, @radix-ui/react-switch, @radix-ui/react-progress, @radix-ui/react-checkbox, @radix-ui/react-collapsible, @radix-ui/react-radio-group, @radix-ui/react-accordion, @radix-ui/react-alert-dialog, @radix-ui/react-toggle, @radix-ui/react-toggle-group[32m[39m
[esbuild] build START { entryPoints: [ '@convex-dev_auth_react', '@radix-ui_react-dialog', '@radix-ui_react-label', '@radix-ui_react-scroll-area', '@radix-ui_react-select', '@radix-ui_react-separator', '@radix-ui_react-slot', '@radix-ui_react-tabs', '@radix-ui_react-tooltip', '@zumer_snapdom', 'class-variance-authority', 'clsx', 'convex_react', 'convex_server', 'date-fns', 'framer-motion', 'input-otp', 'lucide-react', 'next-themes', 'react', 'react-dom_client', 'react-router', 'react_jsx-dev-runtime', 'sonner', 'tailwind-merge', 'react_jsx-runtime', 'react-dom', '@vly-ai_integrations', '@radix-ui_react-dropdown-menu', '@radix-ui_react-avatar', '@radix-ui_react-popover', '@radix-ui_react-switch', '@radix-ui_react-progress', '@radix-ui_react-checkbox', '@radix-ui_react-collapsible', '@radix-ui_react-radio-group', '@radix-ui_react-accordion', '@radix-ui_react-alert-dialog', '@radix-ui_react-toggle', '@radix-ui_react-toggle-group' ], external: 0, platform: 'browser', bundle: true, format: 'esm' }
[esbuild] load#1 /project/node_modules/@convex-dev/auth/dist/react/index.js ns=file
[esbuild] load#2 /project/node_modules/@radix-ui/react-dialog/dist/index.mjs ns=file
[esbuild] load#3 /project/node_modules/@radix-ui/react-label/dist/index.mjs ns=file
[esbuild] load#4 /project/node_modules/@radix-ui/react-scroll-area/dist/index.mjs ns=file
[esbuild] load#5 /project/node_modules/@radix-ui/react-select/dist/index.mjs ns=file
[esbuild] load#6 /project/node_modules/@radix-ui/react-separator/dist/index.mjs ns=file
[esbuild] load#7 /project/node_modules/@radix-ui/react-slot/dist/index.mjs ns=file
[esbuild] load#8 /project/node_modules/@radix-ui/react-tabs/dist/index.mjs ns=file
[esbuild] load#9 /project/node_modules/@radix-ui/react-tooltip/dist/index.mjs ns=file
[esbuild] load#10 /project/node_modules/@zumer/snapdom/dist/snapdom.mjs ns=file
[esbuild] load#11 /project/node_modules/class-variance-authority/dist/index.mjs ns=file
[esbuild] load#12 /project/node_modules/clsx/dist/clsx.mjs ns=file
[esbuild] load#13 /project/node_modules/convex/dist/esm/react/index.js ns=file
[esbuild] load#14 /project/node_modules/convex/dist/esm/server/index.js ns=file
[esbuild] load#15 /project/node_modules/date-fns/index.js ns=file
[esbuild] load#16 /project/node_modules/framer-motion/dist/es/index.mjs ns=file
[esbuild] load#17 /project/node_modules/input-otp/dist/index.mjs ns=file
[esbuild] load#18 /project/node_modules/lucide-react/dist/esm/lucide-react.js ns=file
[esbuild] load#19 /project/node_modules/next-themes/dist/index.mjs ns=file
[esbuild] load#20 /project/node_modules/react/index.js ns=file
[esbuild] load#21 /project/node_modules/react-dom/client.js ns=file
[esbuild] load#22 /project/node_modules/react-router/dist/development/index.mjs ns=file
[esbuild] load#23 /project/node_modules/react/jsx-dev-runtime.js ns=file
[esbuild] load#24 /project/node_modules/sonner/dist/index.mjs ns=file
[esbuild] load#25 /project/node_modules/tailwind-merge/dist/bundle-mjs.mjs ns=file
[esbuild] load#26 /project/node_modules/react/jsx-runtime.js ns=file
[esbuild] load#27 /project/node_modules/react-dom/index.js ns=file
[esbuild] load#28 /project/node_modules/@vly-ai/integrations/dist/index.mjs ns=file
[esbuild] load#29 /project/node_modules/@radix-ui/react-dropdown-menu/dist/index.mjs ns=file
[esbuild] load#30 /project/node_modules/@radix-ui/react-avatar/dist/index.mjs ns=file
[esbuild] load#31 /project/node_modules/@radix-ui/react-popover/dist/index.mjs ns=file
[esbuild] load#32 /project/node_modules/@radix-ui/react-switch/dist/index.mjs ns=file
[esbuild] load#33 /project/node_modules/@radix-ui/react-progress/dist/index.mjs ns=file
[esbuild] load#34 /project/node_modules/@radix-ui/react-checkbox/dist/index.mjs ns=file
[esbuild] load#35 /project/node_modules/@radix-ui/react-collapsible/dist/index.mjs ns=file
[esbuild] load#36 /project/node_modules/@radix-ui/react-radio-group/dist/index.mjs ns=file
[esbuild] load#37 /project/node_modules/@radix-ui/react-accordion/dist/index.mjs ns=file
[esbuild] load#38 /project/node_modules/@radix-ui/react-alert-dialog/dist/index.mjs ns=file
[esbuild] load#39 /project/node_modules/@radix-ui/react-toggle/dist/index.mjs ns=file
[esbuild] load#40 /project/node_modules/@radix-ui/react-toggle-group/dist/index.mjs ns=file
[esbuild] resolve#1 ./use_paginated_query.js imp=/project/node_modules/convex/dist/esm/react/index.js kind=import-statement
[esbuild] resolve#2 ./database.js imp=/project/node_modules/convex/dist/esm/server/index.js kind=import-statement
[esbuild] resolve#3 ./add.js imp=/project/node_modules/date-fns/index.js kind=import-statement
[esbuild] resolve#4 ./components/AnimatePresence/index.mjs imp=/project/node_modules/framer-motion/dist/es/index.mjs kind=import-statement
[esbuild] resolve#5 ./icons/index.js imp=/project/node_modules/lucide-react/dist/esm/lucide-react.js kind=import-statement
[esbuild] resolve#6 ./cjs/react.development.js imp=/project/node_modules/react/index.js kind=require-call
[esbuild] resolve#7 ./cjs/react-dom-client.development.js imp=/project/node_modules/react-dom/client.js kind=require-call
[esbuild] resolve#8 ./chunk-HT4INDD5.mjs imp=/project/node_modules/react-router/dist/development/index.mjs kind=import-statement
[esbuild] resolve#9 ./cjs/react-jsx-dev-runtime.development.js imp=/project/node_modules/react/jsx-dev-runtime.js kind=require-call
[esbuild] resolve#10 ./cjs/react-jsx-runtime.development.js imp=/project/node_modules/react/jsx-runtime.js kind=require-call
[esbuild] resolve#11 ./cjs/react-dom.development.js imp=/project/node_modules/react-dom/index.js kind=require-call
[esbuild] resolve#12 ./use_paginated_query2.js imp=/project/node_modules/convex/dist/esm/react/index.js kind=import-statement
[esbuild] resolve#13 ./impl/registration_impl.js imp=/project/node_modules/convex/dist/esm/server/index.js kind=import-statement
[esbuild] resolve#14 ./addBusinessDays.js imp=/project/node_modules/date-fns/index.js kind=import-statement
[esbuild] resolve#15 ./components/AnimatePresence/PopChild.mjs imp=/project/node_modules/framer-motion/dist/es/index.mjs kind=import-statement
[esbuild] resolve#16 ./icons/fingerprint-pattern.js imp=/project/node_modules/lucide-react/dist/esm/lucide-react.js kind=import-statement
[esbuild] resolve#17 ./chunk-BV7QT456.mjs imp=/project/node_modules/react-router/dist/development/index.mjs kind=import-statement
[esbuild] resolve#18 ./use_queries.js imp=/project/node_modules/convex/dist/esm/react/index.js kind=import-statement
[esbuild] resolve#19 ./impl/actions_impl.js imp=/project/node_modules/convex/dist/esm/server/index.js kind=import-statement
[esbuild] resolve#20 ./addDays.js imp=/project/node_modules/date-fns/index.js kind=import-statement
[esbuild] resolve#21 ./components/AnimatePresence/PresenceChild.mjs imp=/project/node_modules/framer-motion/dist/es/index.mjs kind=import-statement
[esbuild] resolve#22 ./icons/alarm-clock-check.js imp=/project/node_modules/lucide-react/dist/esm/lucide-react.js kind=import-statement
[esbuild] still bundling 4.1s resolves=22 loads=46
[esbuild] resolve#23 ./auth_helpers.js imp=/project/node_modules/convex/dist/esm/react/index.js kind=import-statement
[esbuild] resolve#24 ./pagination.js imp=/project/node_modules/convex/dist/esm/server/index.js kind=import-statement
[esbuild] resolve#25 ./addHours.js imp=/project/node_modules/date-fns/index.js kind=import-statement
[esbuild] resolve#26 ./components/LayoutGroup/index.mjs imp=/project/node_modules/framer-motion/dist/es/index.mjs kind=import-statement
[esbuild] resolve#27 ./icons/alarm-clock-minus.js imp=/project/node_modules/lucide-react/dist/esm/lucide-react.js kind=import-statement
[esbuild] resolve#28 ./chunk-BV7QT456.mjs imp=/project/node_modules/react-router/dist/development/chunk-HT4INDD5.mjs kind=import-statement
[esbuild] still bundling 6.0s resolves=28 loads=51
[esbuild] resolve#29 ./client.js imp=/project/node_modules/@convex-dev/auth/dist/react/index.js kind=import-statement
[esbuild] resolve#30 ./ConvexAuthState.js imp=/project/node_modules/convex/dist/esm/react/index.js kind=import-statement
[esbuild] resolve#31 ./search_filter_builder.js imp=/project/node_modules/convex/dist/esm/server/index.js kind=import-statement
[esbuild] resolve#32 ./addISOWeekYears.js imp=/project/node_modules/date-fns/index.js kind=import-statement
[esbuild] resolve#33 ./components/LazyMotion/index.mjs imp=/project/node_modules/framer-motion/dist/es/index.mjs kind=import-statement
[esbuild] resolve#34 ./icons/alarm-clock-plus.js imp=/project/node_modules/lucide-react/dist/esm/lucide-react.js kind=import-statement
[esbuild] resolve#35 ./hydration.js imp=/project/node_modules/convex/dist/esm/react/index.js kind=import-statement
[esbuild] resolve#36 ./storage.js imp=/project/node_modules/convex/dist/esm/server/index.js kind=import-statement
[esbuild] resolve#37 ./addMilliseconds.js imp=/project/node_modules/date-fns/index.js kind=import-statement
[esbuild] resolve#38 ./components/MotionConfig/index.mjs imp=/project/node_modules/framer-motion/dist/es/index.mjs kind=import-statement
[esbuild] resolve#39 ./icons/arrow-down-a-z.js imp=/project/node_modules/lucide-react/dist/esm/lucide-react.js kind=import-statement
[esbuild] resolve#40 ./sync/client.js imp=/project/node_modules/convex/dist/esm/browser/index.js kind=import-statement
[esbuild] still bundling 9.6s resolves=60 loads=71
[esbuild] still bundling 12.6s resolves=165 loads=128
[esbuild] still bundling 15.3s resolves=253 loads=150
[esbuild] still bundling 18.5s resolves=427 loads=226
[esbuild] still bundling 22.5s resolves=538 loads=281
[esbuild] still bundling 24.4s resolves=552 loads=285
[esbuild] still bundling 27.1s resolves=676 loads=294
[esbuild] still bundling 30.3s resolves=842 loads=394
[esbuild] still bundling 33.2s resolves=1048 loads=489
[esbuild] still bundling 36.0s resolves=1229 loads=536
[esbuild] still bundling 39.0s resolves=1399 loads=536
[esbuild] still bundling 42.0s resolves=1641 loads=781
[esbuild] still bundling 45.0s resolves=2039 loads=792
[esbuild] still bundling 48.2s resolves=2407 loads=1008
[esbuild] still bundling 51.0s resolves=2570 loads=1055
[esbuild] still bundling 54.0s resolves=2776 loads=1058
[esbuild] still bundling 57.0s resolves=2876 loads=1058
[esbuild] still bundling 60.0s resolves=3021 loads=1058
[esbuild] still bundling 63.0s resolves=3173 loads=1058
[esbuild] still bundling 66.0s resolves=3311 loads=1058
[esbuild] still bundling 69.0s resolves=3445 loads=1058
[esbuild] still bundling 72.0s resolves=3609 loads=1058
[esbuild] still bundling 75.0s resolves=3755 loads=1058
