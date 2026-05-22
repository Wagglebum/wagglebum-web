'use client';

import { MDXRemote, type MDXRemoteSerializeResult } from 'next-mdx-remote';

export function MdxContent({ source }: { source: MDXRemoteSerializeResult }) {
  return <MDXRemote {...source} />;
}
