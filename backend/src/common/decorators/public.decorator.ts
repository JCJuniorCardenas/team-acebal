import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/** Marca un endpoint como accesible sin token. Todo lo demás requiere login. */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
