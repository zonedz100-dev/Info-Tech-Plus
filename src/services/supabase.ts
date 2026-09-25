import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  bucket: string;
}

const SUPABASE_CONFIG_KEY = 'tp_supabase_config';
const DEFAULT_BUCKET = 'store-logos';

// Retrieve config from env or local storage
export const getSupabaseConfig = (): SupabaseConfig => {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';
  const envBucket = (import.meta.env.VITE_SUPABASE_BUCKET as string) || DEFAULT_BUCKET;

  try {
    const saved = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        url: parsed.url || envUrl,
        anonKey: parsed.anonKey || envKey,
        bucket: parsed.bucket || envBucket || DEFAULT_BUCKET
      };
    }
  } catch (err) {
    console.warn('Failed to parse saved Supabase config:', err);
  }

  return {
    url: envUrl,
    anonKey: envKey,
    bucket: envBucket || DEFAULT_BUCKET
  };
};

export const saveSupabaseConfig = (config: Partial<SupabaseConfig>): void => {
  const current = getSupabaseConfig();
  const updated: SupabaseConfig = {
    url: config.url !== undefined ? config.url.trim() : current.url,
    anonKey: config.anonKey !== undefined ? config.anonKey.trim() : current.anonKey,
    bucket: config.bucket !== undefined ? config.bucket.trim() : current.bucket
  };
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(updated));
};

let cachedClient: { client: SupabaseClient | null; url: string; key: string } = {
  client: null,
  url: '',
  key: ''
};

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return null;
  }

  if (cachedClient.client && cachedClient.url === config.url && cachedClient.key === config.anonKey) {
    return cachedClient.client;
  }

  try {
    const client = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false
      }
    });
    cachedClient = { client, url: config.url, key: config.anonKey };
    return client;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
};

export const isSupabaseConfigured = (): boolean => {
  const config = getSupabaseConfig();
  return Boolean(config.url && config.anonKey);
};

export interface UploadLogoResult {
  success: boolean;
  url: string;
  storageType: 'supabase' | 'local';
  message: string;
  error?: string;
}

/**
 * Uploads a logo file (File or Blob) to Supabase Storage if configured.
 * If Supabase is not configured or fails, falls back safely to local base64 storage so the application never breaks.
 */
export const uploadStoreLogoToSupabase = async (
  fileOrBlob: File | Blob,
  fileNamePrefix: string = 'logo'
): Promise<UploadLogoResult> => {
  const config = getSupabaseConfig();
  const client = getSupabaseClient();

  // Convert to Base64 as fallback or for instant local storage
  const base64Fallback = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file as Base64'));
    reader.readAsDataURL(fileOrBlob);
  });

  if (!client || !config.url || !config.anonKey) {
    return {
      success: true,
      url: base64Fallback,
      storageType: 'local',
      message: 'تم الحفظ في التخزين المحلي للمتجر (يرجى إدخال مفاتيح Supabase للربط السحابي المباشر)'
    };
  }

  try {
    const bucket = config.bucket || DEFAULT_BUCKET;
    const extension = fileOrBlob.type.includes('png') 
      ? 'png' 
      : fileOrBlob.type.includes('svg') 
        ? 'svg' 
        : fileOrBlob.type.includes('webp') 
          ? 'webp' 
          : 'jpg';

    const timestamp = Date.now();
    const filePath = `store-brand/${fileNamePrefix}-${timestamp}.${extension}`;

    // Upload to Supabase bucket
    const { error: uploadError } = await client.storage
      .from(bucket)
      .upload(filePath, fileOrBlob, {
        upsert: true,
        contentType: fileOrBlob.type || 'image/png'
      });

    if (uploadError) {
      console.warn('Supabase storage upload failed, using local fallback:', uploadError);
      return {
        success: true,
        url: base64Fallback,
        storageType: 'local',
        message: `تم الحفظ محلياً (خطأ سحابة Supabase: ${uploadError.message})`,
        error: uploadError.message
      };
    }

    // Get Public URL
    const { data: publicUrlData } = client.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (publicUrlData?.publicUrl) {
      return {
        success: true,
        url: publicUrlData.publicUrl,
        storageType: 'supabase',
        message: 'تم رفع وحفظ لوغو المتجر بنجاح في Supabase Storage!'
      };
    }

    return {
      success: true,
      url: base64Fallback,
      storageType: 'local',
      message: 'تم الحفظ محلياً (تعذر جلب الرابط العام من سلة التخزين)'
    };
  } catch (err: any) {
    console.error('Error uploading to Supabase Storage:', err);
    return {
      success: true,
      url: base64Fallback,
      storageType: 'local',
      message: `تم الحفظ محلياً كبديل موثوق (${err?.message || 'خطأ اتصال'})`,
      error: err?.message
    };
  }
};
