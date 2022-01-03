import { GetStaticProps } from 'next';
import Link from 'next/link'
import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'
import styles from './home.module.scss';
import { FiUser } from 'react-icons/fi';
import { AiOutlineCalendar } from 'react-icons/ai';
import formatDateBrasilian from '../utils/formatDate';
import Head from 'next/head'
import { useEffect, useState } from 'react';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
  preview: boolean
}

export default function Home({ postsPagination, preview }: HomeProps) {
  const { next_page, results } = postsPagination
  const [posts, setPosts] = useState<Post[]>([]);
  const [nextPage, setNextPage] = useState('');

  useEffect(() => {
    setNextPage(next_page)
    setPosts(results)
  }, [next_page, results])

  const handlePagination = async () => {
    await fetch(nextPage).
      then(response => response.json()).
      then(async res => {
        console.log('res', res);

        const formatData = await res.results.map((post: Post) => (
          {
            uid: post.uid,
            first_publication_date: post.first_publication_date,
            data: {
              title: post.data.title,
              subtitle: post.data.subtitle,
              author: post.data.author,
            }
          }
        ))

        setPosts([...posts, ...formatData]);
        setNextPage(res.next_page);
      })
  }

  return (
    <>
      <Head>
        <title>Home | Spacetraveling</title>
      </Head>
      <main className={styles.contentContainer}>
        <div className={styles.listPosts}>
          {posts.map(post => (
            <Link href={`post/${post.uid}`} key={post.uid}>
              <a href={`post/${post.uid}`} >
                <h2>{post.data.title}</h2>
                <p>{post.data.subtitle}</p>
                <div>
                  <span>
                    <AiOutlineCalendar size={16} />
                    {formatDateBrasilian(post.first_publication_date)}
                  </span>
                  <span>
                    <FiUser size={16} />
                    {post.data.author}
                  </span>
                </div>
              </a>
            </Link>
          ))}
        </div>
        {
          nextPage && (
            <button type='button' onClick={handlePagination} className={styles.morePosts}>
              Carregar mais posts
            </button>
          )
        }

        {
          preview && (
            <aside className={styles.viewButton}>
              <Link href="/api/exit-preview">
                <a>Sair do modo Preview</a>
              </Link>
            </aside>
          )
        }
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async ({
  preview = false,
  previewData,
}) => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'post'),
  ], {
    fetch: ['post.title', 'post.subtitle', 'post.author', 'post.first_publication_date'],
    pageSize: 2,
    ref: previewData?.ref ?? null
  });

  const postsPagination = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      }
    }
  })
  return {
    props: {
      postsPagination: {
        next_page: postsResponse.next_page,
        results: postsPagination,
      },
      preview
    }
  }
};
