export default function PrettyJSON({ text }: { text: any }) {
  return (
    <div>
      <pre>{JSON.stringify(text, null, 2)}</pre>
    </div>
  );
}
