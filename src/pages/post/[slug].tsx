import next, { GetStaticPaths, GetStaticProps } from 'next';

import { getPrismicClient } from '../../services/prismic';
import Head from 'next/head';
import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import { AiOutlineCalendar, AiOutlineClockCircle } from 'react-icons/ai';
import { FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client'
import { RichText } from 'prismic-dom';
import formatDateBrasilian, { formatDateandHourBrasilian } from '../../utils/formatDate';
import { useRouter } from 'next/router';
import Comments from '../../components/Comments';
import Link from 'next/link';

interface Post {
  first_publication_date: string | null;
  last_publication_date: string | null;
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

interface PostPagination {
  title: string,
  uid: string
}
interface PostProps {
  post: Post;
  previousPost: PostPagination | null;
  nextPost: PostPagination | null;
}

export default function Post({ post, previousPost, nextPost }: PostProps) {

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
        {post.last_publication_date != post.first_publication_date && <span className={styles.editionPost}>
          *editado em {formatDateandHourBrasilian(post.last_publication_date)} </span>}
        <section className={styles.containerEstrofes}>
          {
            post.data.content.map(({ heading, body }, index) => (
              <article key={index} className={styles.estrofe}>
                <h2>{heading}</h2>
                <div dangerouslySetInnerHTML={{ __html: `${RichText.asHtml(body)}` }}></div>
              </article>
            ))
          }
        </section>
        <section className={styles.containerPagination}>
          <hr />
          <div className={styles.pagination}>
            <div>
              {previousPost && <Link href={`/post/${previousPost.uid}`}>
                <a>
                  <span className={styles.paginationTitle}>{previousPost.title}</span>
                  <span className={styles.nextPreviouPost}>Post anterior</span>
                </a>
              </Link>}
            </div>
            <div>
              {nextPost && <Link href={`/post/${nextPost.uid}`}>
                <a>
                  <span className={styles.paginationTitle}>{nextPost.title}</span>
                  <span className={styles.nextPreviouPost}>Próximo post</span>
                </a>
              </Link>}
            </div>
          </div>
        </section>
      </main>
      <Comments />
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
      params: { slug: post.uid},
    }
  })
  return {
    paths,
    fallback: true,
  }
};

 const paginationPost = (posts, slug) => {
    const findIndexPost = posts.findIndex(post => post.uid === slug);
    let sizeArray = posts.length;
    let previousPost = null;
    let nextPost = null;
    
    if(findIndexPost === 0 && sizeArray > 1) {
      nextPost = {
        title: posts[findIndexPost + 1].data.title,
        uid: posts[findIndexPost + 1].uid,
      }
    }else if(findIndexPost == (sizeArray - 1)){
      previousPost = {
        title: posts[findIndexPost - 1].data.title,
        uid: posts[findIndexPost - 1].uid,
      }
    }else{
      nextPost = {
        title: posts[findIndexPost + 1].data.title,
        uid: posts[findIndexPost + 1].uid,
      }
      previousPost = {
        title: posts[findIndexPost - 1].data.title,
        uid: posts[findIndexPost - 1].uid,
      }
    }
    return {previousPost, nextPost};
  }


export const getStaticProps = async ({ params }) => {
  const { slug } = params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('post', slug, {});

  const responsePaginationPost = await prismic.query([
    Prismic.Predicates.at('document.type', 'post'),
  ]);

  const {nextPost, previousPost} = paginationPost(responsePaginationPost.results, slug);
  const post = {
    first_publication_date: response.first_publication_date,
    last_publication_date: response.last_publication_date,
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
    props: {
      post,
      nextPost,
      previousPost
    }
  }
};
