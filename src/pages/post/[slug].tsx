import { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import Head from 'next/head';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { AiOutlineCalendar, AiOutlineClockCircle } from 'react-icons/ai';
import { FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom';
import formatDateBrasilian from '../../utils/formatDate';
import { useRouter } from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {

  const router = useRouter()
  
  const timeText = post.data.content.reduce((acc, curr) => {
    const body = RichText.asText(curr.body);
    const textLength = body.split(/\s/g).length;
    const time = Math.ceil(textLength / 200);
    return acc + time; 
  }, 0)

  if (router.isFallback) {
    return <div>Carregando...</div>
  }

  return (
    <>
      <Head>
        <title>Title | Spacetraveling</title>
      </Head>
      <main className={styles.content}>
        <section>
          <img src={post.data.banner.url} alt={post.data.title} />
          <h1>{post.data.title}</h1>
          <div className={styles.infoPost}>
            <span>
              <AiOutlineCalendar size={16} />
              {formatDateBrasilian(post.first_publication_date)}
            </span>
            <span>
              <FiUser size={16} />
              {post.data.author}
            </span>
            <span>
              <AiOutlineClockCircle size={16} />
              {timeText} min
            </span>
          </div>
          {
            post.data.content.map(({ heading, body }, index) => (
              <article key={index} className={styles.estrofe}>
                <h2>{heading}</h2>
                <div dangerouslySetInnerHTML={{ __html: `${RichText.asHtml(body)}` }}></div>
              </article>
            ))
          }
        </section>
      </main>
    </>
  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'post'),
  ], {
    fetch: '*',
    pageSize: 2,
  });

  const paths = posts.results.map(post => {
    return {
      params: { slug: post.uid },
    }
  })
  return {
    paths,
    fallback: true,
  }
};

export const getStaticProps = async context => {

  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', context.params.slug, {});
  const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      author: response.data.author,
      banner: {
        url: response.data.banner.url,
      },
      content: response.data.content.map(({ heading, body }) => {
        return {
          heading: heading,
          body: body,
        }
      }),
    }
  }

  return {
    props: { post }
  }
};
