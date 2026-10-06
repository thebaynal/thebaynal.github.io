import { useId } from 'react'

/** A folded reflective ribbon, kept decorative and independent of page interactions. */
export default function HeroSculpture() {
  const prefix = `hero-chrome-${useId().replace(/:/g, '')}`
  const paint = (name) => `url(#${prefix}-${name})`

  return (
    <svg className="hero__sculpture" viewBox="0 0 640 520" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${prefix}-body`} x1="166" y1="67" x2="455" y2="426" gradientUnits="userSpaceOnUse">
          <stop stopColor="#c9d1d7" />
          <stop offset=".13" stopColor="#effff8" />
          <stop offset=".26" stopColor="#beb5d8" />
          <stop offset=".35" stopColor="#4d5262" />
          <stop offset=".43" stopColor="#e6c6e0" />
          <stop offset=".55" stopColor="#fff7f0" />
          <stop offset=".68" stopColor="#ccd9d2" />
          <stop offset=".82" stopColor="#656270" />
          <stop offset=".92" stopColor="#d2b1df" />
          <stop offset="1" stopColor="#e6edf1" />
        </linearGradient>
        <linearGradient id={`${prefix}-crown`} x1="345" y1="64" x2="502" y2="241" gradientUnits="userSpaceOnUse">
          <stop stopColor="#272b38" />
          <stop offset=".1" stopColor="#c9b1d7" />
          <stop offset=".29" stopColor="#faf3ff" />
          <stop offset=".46" stopColor="#e9dfdf" />
          <stop offset=".58" stopColor="#e8b2a0" />
          <stop offset=".7" stopColor="#f5e5c9" />
          <stop offset=".84" stopColor="#5b5a62" />
          <stop offset="1" stopColor="#ced7dd" />
        </linearGradient>
        <linearGradient id={`${prefix}-shoulder`} x1="118" y1="175" x2="312" y2="149" gradientUnits="userSpaceOnUse">
          <stop stopColor="#32353f" />
          <stop offset=".12" stopColor="#c4d9d4" />
          <stop offset=".3" stopColor="#eefff1" />
          <stop offset=".49" stopColor="#dcd9ee" />
          <stop offset=".7" stopColor="#dfaecd" />
          <stop offset=".86" stopColor="#f5d4ce" />
          <stop offset="1" stopColor="#7b6e8c" />
        </linearGradient>
        <linearGradient id={`${prefix}-fold`} x1="273" y1="191" x2="408" y2="375" gradientUnits="userSpaceOnUse">
          <stop stopColor="#434451" />
          <stop offset=".18" stopColor="#9291b1" />
          <stop offset=".33" stopColor="#decaff" />
          <stop offset=".47" stopColor="#fff8ff" />
          <stop offset=".61" stopColor="#d7f4e7" />
          <stop offset=".76" stopColor="#8bb7a3" />
          <stop offset="1" stopColor="#333a3e" />
        </linearGradient>
        <linearGradient id={`${prefix}-base`} x1="189" y1="315" x2="426" y2="447" gradientUnits="userSpaceOnUse">
          <stop stopColor="#525566" />
          <stop offset=".2" stopColor="#b5b0d6" />
          <stop offset=".37" stopColor="#f1e8ff" />
          <stop offset=".49" stopColor="#faf9f6" />
          <stop offset=".64" stopColor="#d4e7df" />
          <stop offset=".8" stopColor="#88949a" />
          <stop offset=".92" stopColor="#3e3c4b" />
          <stop offset="1" stopColor="#c7b6d6" />
        </linearGradient>
        <linearGradient id={`${prefix}-edge`} x1="361" y1="220" x2="433" y2="294" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fdfaff" />
          <stop offset=".3" stopColor="#e4accd" />
          <stop offset=".53" stopColor="#c891c5" />
          <stop offset=".8" stopColor="#7b7c97" />
          <stop offset="1" stopColor="#303741" />
        </linearGradient>
        <radialGradient id={`${prefix}-shadow`} cx=".5" cy=".5" r=".5">
          <stop stopColor="#434650" stopOpacity=".15" />
          <stop offset=".6" stopColor="#747985" stopOpacity=".06" />
          <stop offset="1" stopColor="#747985" stopOpacity="0" />
        </radialGradient>
      </defs>

      <ellipse cx="323" cy="461" rx="222" ry="26" fill={paint('shadow')} />

      <path d="M362 48C434 31 506 59 518 129C527 181 490 207 454 229C423 249 411 274 439 303C478 343 489 360 468 403C449 445 400 459 355 444C320 432 309 402 286 388C260 371 238 384 208 397C167 417 121 405 109 370C94 329 113 298 146 278C171 262 181 241 166 219C151 197 119 190 117 154C114 117 131 83 161 71C198 56 231 74 251 96C271 118 273 145 295 155C314 164 341 153 346 135C351 117 335 110 334 90C332 70 343 54 362 48Z" fill={paint('body')} stroke="#5c6070" strokeWidth="1.3" />

      <path d="M363 49C415 34 466 45 496 85C520 115 522 152 506 177C492 199 472 209 454 220C432 233 415 249 413 269C398 258 388 244 394 226C403 199 441 188 454 162C465 141 452 119 431 111C409 103 388 109 374 123C363 134 353 143 341 146C351 131 343 116 336 103C322 79 339 54 363 49Z" fill={paint('crown')} />

      <path d="M163 72C200 57 231 75 251 98C271 121 272 144 296 156C322 169 340 150 345 135C342 160 325 180 301 183C269 187 250 169 235 145C221 122 208 109 189 111C169 113 154 128 155 147C156 168 179 178 189 194C204 219 198 242 180 257C173 268 160 277 146 280C173 263 182 242 167 221C154 203 122 190 119 157C115 117 132 85 163 72Z" fill={paint('shoulder')} />

      <path d="M305 182C333 177 355 152 378 143C400 135 421 137 432 149C442 160 437 174 422 184C391 205 365 222 358 246C351 272 367 289 388 311C410 335 435 349 441 373C446 391 438 411 425 423C422 399 409 392 385 379C353 363 327 349 309 324C292 300 284 278 288 253C292 226 310 211 326 203C334 199 333 186 305 182Z" fill={paint('fold')} />

      <path d="M144 284C165 279 179 277 195 284C215 292 230 309 246 325C264 343 283 351 308 349C329 347 348 330 366 331C393 332 404 349 409 366C413 383 406 398 394 408C382 418 367 415 353 400C332 378 316 367 288 372C260 377 239 394 208 404C169 417 129 404 113 375C95 341 108 305 144 284Z" fill={paint('base')} />

      <path d="M412 262C414 277 426 289 439 303C454 319 467 333 474 349C451 340 432 324 418 311C402 296 390 287 385 272C380 256 384 241 396 230C389 244 397 254 412 262Z" fill={paint('edge')} />

      <path d="M357 62C398 42 445 48 474 77" stroke="#fff" strokeOpacity=".8" strokeWidth="3" strokeLinecap="round" />
      <path d="M483 92C497 114 503 136 496 155" stroke="#fff8ed" strokeOpacity=".9" strokeWidth="5" strokeLinecap="round" />
      <path d="M173 86C194 77 218 88 232 105" stroke="#fff" strokeOpacity=".8" strokeWidth="4" strokeLinecap="round" />
      <path d="M151 177C158 189 173 195 182 209" stroke="#fafff5" strokeOpacity=".75" strokeWidth="2" strokeLinecap="round" />
      <path d="M368 179C346 196 326 218 323 243C320 263 329 281 342 299" stroke="#fff" strokeOpacity=".72" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M126 340C123 367 143 388 170 389" stroke="#fcfbff" strokeOpacity=".75" strokeWidth="3" strokeLinecap="round" />
      <path d="M360 424C383 443 411 439 431 427" stroke="#fbebff" strokeOpacity=".7" strokeWidth="2" strokeLinecap="round" />
      <path d="M239 148C252 172 270 189 298 191" stroke="#51465e" strokeOpacity=".65" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M352 250C349 274 362 292 384 312" stroke="#272e3d" strokeOpacity=".35" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
