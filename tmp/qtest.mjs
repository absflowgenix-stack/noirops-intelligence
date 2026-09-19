[96msrc/pages/dashboard/Analytics.tsx[0m:[93m142[0m:[93m32[0m - [91merror[0m[90m TS7006: [0mParameter 'd' implicitly has an 'any' type.

[7m142[0m           ) : chartData.every((d) => d.count === 0) ? (
[7m   [0m [91m                               ~[0m

[96msrc/pages/dashboard/Analytics.tsx[0m:[93m270[0m:[93m43[0m - [91merror[0m[90m TS18046: [0m'b' is of type 'unknown'.

[7m270[0m                   .sort(([, a], [, b]) => b - a)
[7m   [0m [91m                                          ~[0m

[96msrc/pages/dashboard/Analytics.tsx[0m:[93m270[0m:[93m47[0m - [91merror[0m[90m TS18046: [0m'a' is of type 'unknown'.

[7m270[0m                   .sort(([, a], [, b]) => b - a)
[7m   [0m [91m                                              ~[0m

[96msrc/pages/dashboard/Analytics.tsx[0m:[93m277[0m:[93m61[0m - [91merror[0m[90m TS2322: [0mType 'unknown' is not assignable to type 'ReactNode'.

[7m277[0m                       <span className=text-sm font-medium>{count}</span>
[7m   [0m [91m                                                            ~~~~~~~[0m

  [96mnode_modules/@types/react/index.d.ts[0m:[93m2276[0m:[93m9[0m
    [7m2276[0m         children?: ReactNode | undefined;
    [7m    [0m [96m        ~~~~~~~~[0m
    The expected type comes from property 'children' which is declared here on type 'DetailedHTMLProps<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>'

[96msrc/pages/dashboard/Analytics.tsx[0m:[93m296[0m:[93m36[0m - [91merror[0m[90m TS7006: [0mParameter 'event' implicitly has an 'any' type.

[7m296[0m               {recentActivity.map((event) => (
[7m   [0m [91m                                   ~~~~~[0m

[96msrc/pages/dashboard/BrandVoices.tsx[0m:[93m79[0m:[93m18[0m - [91merror[0m[90m TS18046: [0m'voice' is of type 'unknown'.

[7m79[0m     setEditingId(voice._id);
[7m  [0m [91m                 ~~~~~[0m

[96msrc/pages/dashboard/BrandVoices.tsx[0m:[93m81[0m:[93m13[0m - [91merror[0m[90m TS18046: [0m'voice' is of type 'unknown'.

[7m81[0m       name: voice.name,
[7m  [0m [91m            ~~~~~[0m

[96msrc/pages/dashboard/BrandVoices.tsx[0m:[93m82[0m:[93m20[0m - [91merror[0m[90m TS18046: [0m'voice' is of type 'unknown'.

[7m82[0m       description: voice.description || ,
[7m  [0m [91m                   ~~~~~[0m

[96msrc/pages/dashboard/BrandVoices.tsx[0m:[93m83[0m:[93m17[0m - [91merror[0m[90m TS18046: [0m'voice' is of type 'unknown'.

[7m83[0m       industry: voice.industry || ,
[7m  [0m [91m                ~~~~~[0m

[96msrc/pages/dashboard/BrandVoices.tsx[0m:[93m84[0m:[93m23[0m - [91merror[0m[90m TS18046: [0m'voice' is of type 'unknown'.

[7m84[0m       targetAudience: voice.targetAudience || ,
[7m  [0m [91m                      ~~~~~[0m

[96msrc/pages/dashboard/BrandVoices.tsx[0m:[93m85[0m:[93m13[0m - [91merror[0m[90m TS18046: [0m'voice' is of type 'unknown'.

[7m85[0m       tone: voice.tone || ,
[7m  [0m [91m            ~~~~~[0m

[96msrc/pages/dashboard/BrandVoices.tsx[0m:[93m86[0m:[93m20[0m - [91merror[0m[90m TS18046: [0m'voice' is of type 'unknown'.

[7m86[0m       personality: voice.personality || ,
[7m  [0m [91m                   ~~~~~[0m

[96msrc/pages/dashboard/BrandVoices.tsx[0m:[93m87[0m:[93m20[0m - [91merror[0m[90m TS18046: [0m'voice' is of type 'unknown'.

[7m87[0m       coreValues: (voice.coreValues || []).join(, ),
[7m  [0m [91m                   ~~~~~[0m

[96msrc/pages/dashboard/BrandVoices.tsx[0m:[93m88[0m:[93m25[0m - [91merror[0m[90m TS18046: [0m'voice' is of type 'unknown'.

[7m88[0m       productsServices: voice.productsServices || ,
[7m  [0m [91m                        ~~~~~[0m

[96msrc/pages/dashboard/BrandVoices.tsx[0m:[93m89[0m:[93m29[0m - [91merror[0m[90m TS18046: [0m'voice' is of type 'unknown'.

[7m89[0m       preferredVocabulary: (voice.preferredVocabulary || []).join(, ),
[7m  [0m [91m                            ~~~~~[0m

[96msrc/pages/dashboard/BrandVoices.tsx[0m:[93m90[0m:[93m22[0m - [91merror[0m[90m TS18046: [0m'voice' is of type 'unknown'.

[7m90[0m       wordsToAvoid: (voice.wordsToAvoid || []).join(, ),
[7m  [0m [91m                     ~~~~~[0m

[96msrc/pages/dashboard/BrandVoices.tsx[0m:[93m91[0m:[93m23[0m - [91merror[0m[90m TS18046: [0m'voice' is of type 'unknown'.

[7m91[0m       exampleContent: voice.exampleContent || ,
[7m  [0m [91m                      ~~~~~[0m

[96msrc/pages/dashboard/BrandVoices.tsx[0m:[93m199[0m:[93m24[0m - [91merror[0m[90m TS7006: [0mParameter 'voice' implicitly has an 'any' type.

[7m199[0m           {voices.map((voice) => (
[7m   [0m [91m                       ~~~~~[0m

[96msrc/pages/dashboard/Calendar.tsx[0m:[93m249[0m:[93m49[0m - [91merror[0m[90m TS7006: [0mParameter 'event' implicitly has an 'any' type.

[7m249[0m                     {dayEvents.slice(0, 3).map((event) => (
[7m   [0m [91m                                                ~~~~~[0m

[96msrc/pages/dashboard/Calendar.tsx[0m:[93m309[0m:[93m41[0m - [91merror[0m[90m TS7006: [0mParameter 'event' implicitly has an 'any' type.

[7m309[0m                 {selectedDayEvents.map((event) => (
[7m   [0m [91m                                        ~~~~~[0m

[96msrc/pages/dashboard/ContentHistory.tsx[0m:[93m74[0m:[93m28[0m - [91merror[0m[90m TS7006: [0mParameter 'item' implicitly has an 'any' type.

[7m74[0m     return content.filter((item) => {
[7m  [0m [91m                           ~~~~[0m

[96msrc/pages/dashboard/ContentHistory.tsx[0m:[93m90[0m:[93m38[0m - [91merror[0m[90m TS7006: [0mParameter 'c' implicitly has an 'any' type.

[7m90[0m     const set = new Set(content.map((c) => c.platform).filter(Boolean));
[7m  [0m [91m                                     ~[0m

[96msrc/pages/dashboard/ContentHistory.tsx[0m:[93m201[0m:[93m26[0m - [91merror[0m[90m TS7006: [0mParameter 'item' implicitly has an 'any' type.

[7m201[0m           {filtered.map((item) => (
[7m   [0m [91m                         ~~~~[0m

[96msrc/pages/dashboard/FeedbackPage.tsx[0m:[93m206[0m:[93m32[0m - [91merror[0m[90m TS7006: [0mParameter 'fb' implicitly has an 'any' type.

[7m206[0m               {myFeedback.map((fb) => (
[7m   [0m [91m                               ~~[0m

[96msrc/pages/dashboard/Home.tsx[0m:[93m197[0m:[93m37[0m - [91merror[0m[90m TS7006: [0mParameter 'item' implicitly has an 'any' type.

[7m197[0m                 {recentContent.map((item) => (
[7m   [0m [91m                                    ~~~~[0m

[96msrc/pages/dashboard/Home.tsx[0m:[93m254[0m:[93m38[0m - [91merror[0m[90m TS7006: [0mParameter 'event' implicitly has an 'any' type.

[7m254[0m                 {recentActivity.map((event) => (
[7m   [0m [91m                                     ~~~~~[0m


Found 26 errors.

