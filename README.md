# Markup Annotation Tool for ML and NLP

![](https://markup-storage.s3.eu-west-2.amazonaws.com/annotate-dark-v2.png)

Markup is an online annotation tool that can be used to transform unstructured documents into structured formats for NLP and ML tasks, such as named-entity recognition. Markup learns as you annotate to predict and suggest complex annotations, and also provides integrated access to common and custom ontologies for concept mapping.

# Key Features

- **Predictive annotation** - Markup's machine learning-powered predictive annotation feature suggests complex annotations as you work, making the process of annotating documents more efficient and saving you valuable time.

- **Integrated ontology access** Markup provides integrated access to a wide range of common ontologies (e.g. UMLS, SNOMED-CT, ICD-10), as well as the ability to upload custom ontologies, for concept mapping.

- **Predictive ontology mapping** - Markup's predictive ontology mapping feature uses machine learning to suggest appropriate mappings to standard and custom terminologies based on the text you're annotating.

- **User-friendly interface** - Whether you're a technical expert or a beginner, Markup's user-friendly interface makes it easy for anyone to start annotating documents with minimal setup.

# Installation

To install and run Markup locally:

1. Clone the repository and install dependencies: `git clone https://github.com/samueldobbie/markup && cd markup && pnpm install`
1. Copy `.env.example` to `.env.local`
1. Install the [Supabase CLI](https://supabase.com/docs/guides/cli)
1. Start Supabase: `supabase start`. This will output an API URL, anon key, and service role key. Add the URL and anon key to `.env.local` as `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`, and the service role key as `SUPABASE_SERVICE_ROLE_KEY`. Set `MODEL_CREDENTIALS_KEY` to any secret used to encrypt workspace API keys (or a 64-character hex key).
1. Run the web app and API: `pnpm dev` and `pnpm dev:api`
1. Open Markup in your web browser at `http://localhost:3000`

# Usage

To get started with Markup, read the [quick start guide](https://getmarkup.com/docs).

# Contributions

Contributions to Markup are appreciated. If you'd like to contribute, please follow these guidelines:

1. Fork the repository
1. Create a new branch for your feature
1. Make your changes
1. Submit a pull request for review

# Support

If you have any questions or need assistance with Markup, you can contact me at [sam@getmarkup.com](mailto:sam@getmarkup.com).
