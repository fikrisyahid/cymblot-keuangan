export default function PrettyJSON({ content }: { content: object }) {
  return (
    <div>
      <pre>{JSON.stringify(content, null, 2)}</pre>
    </div>
  );
}
